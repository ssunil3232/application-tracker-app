import Application from './utils/application.js';
const baseURL = 'http://localhost:3000/';
import Router from "./utils/router.js";
const router = Router;
//Variables
const scoreMap = {
    'high': 'var(--high-score)',
    'medium': 'var(--medium-score)',
    'low': 'var(--low-score)',
}

//Selectors
const addApplicationButton = document.querySelector('.add-btn');
const dialog = document.getElementById('addDialog');
const cancelNewApplicationButton = document.getElementById('closeDialogBtn');
const submitNewApplicationButton = document.querySelector('.submit-btn');
const tableBody = document.querySelector('.application-table-body');
const dialogHeader = document.querySelector('.dialog-title');
let editTarget = null;// Global variable to store the item being edited
const searchBar = document.getElementById('search-bar');
const filterDropdown = document.getElementById('apps-done');

// To load on DOM loaded
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    //initialise the routes
    router.init();
});
// Import data on load
async function loadData(query = ''){
    const res = await fetch(
        baseURL + 'applications' + '?search=' + `${encodeURIComponent(query)}`,
        {
            method: 'GET'
        }
    );
    const data = await res.json();
    const sortedData = sortApplicationsByDate(data);
    tableBody.innerHTML = '';
    sortedData.forEach((item)=>{
        const applicationData = {
            id: item.id,
            companyName: item.companyName,
            industryName: item.industryName,
            jobTitle: item.jobTitle,
            jobType: item.jobType,
            submissionDate: item.submissionDate,
            applicationUrl: item.applicationUrl,
            confidenceScore: item.confidenceScore
        };
        // Create a new Application object with the properties
        const newApplicationObj = new Application(applicationData);
        addApplicationData(newApplicationObj);
    })
}

//Event listener
searchBar.addEventListener('keyup', (event) => {
    const query = event.target.value;
    loadData(query);
});

// Add event listener for input event to detect clear button click
searchBar.addEventListener('input', (event) => {
    if (event.target.value === '') {
        loadData();
    }
});

// Event listener for the dropdown
filterDropdown.addEventListener('change', (event) => {
    const filterValue = event.target.value;
    filterData(filterValue);
});

addApplicationButton.addEventListener('click', newApplication);
submitNewApplicationButton.addEventListener('click', function(event){
    if (editTarget) {
        submitEdit(event);
    } else {
        updateApplications(event);
    }
});
cancelNewApplicationButton.addEventListener('click', function() {
    dialog.close();
});

//functions
function addApplicationData(data){
    // Create a new table row
    const newRow = document.createElement('tr');
    // Set unique identifier
    newRow.setAttribute('data-id', data.id); 
    newRow.classList.add('application-row');
    newRow.innerHTML = `
        <td></td>
        <td>${data.companyName}</td>
        <td>${data.jobTitle}</td>
        <td>${data.submissionDate}</td>
        <td><a href="${data.applicationUrl}" target="_blank">${data.applicationUrl}</a></td>
        <td></td>
    `;
    // Mapping the confidence score color
    const scorePill = document.createElement('span');
    scorePill.classList.add('score-pill');
    scorePill.style.backgroundColor = scoreMap[data.confidenceScore.toLowerCase()];
    scorePill.innerText = data.confidenceScore;
    // Insert the score pill into the first cell
    newRow.cells[0].appendChild(scorePill);
    
    //Creating action buttons
    const actionButtons = document.createElement('div');
    actionButtons.classList.add('action-btns');

    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<i class="fas fa-solid fa-trash-can"></i>'
    deleteButton.classList.add('delete-btn');
    deleteButton.addEventListener('click', deleteEdit);
    actionButtons.appendChild(deleteButton);

    const editButton = document.createElement('button');
    editButton.innerHTML = '<i class="fas fa-solid fa-pen-to-square"></i>'
    editButton.classList.add('edit-btn');
    editButton.addEventListener('click', deleteEdit);
    actionButtons.appendChild(editButton);

    const collapseButton = document.createElement('button');
    collapseButton.innerHTML = '<i class="fas fa-solid fa-eye"></i>'
    collapseButton.classList.add('collapse-btn');

    // Collapsed details
    const collapsedRow = document.createElement('tr');
    collapsedRow.classList.add('collapsed-row');
    collapsedRow.style.display = 'table-row';
    //fetch the html for timeline
    fetch('timeline.html')
        .then(response => response.text())
        .then(data => {
            collapsedRow.innerHTML = `
                <td colspan="6">
                    <div class="collapsed-row-div">
                        <div class="collapsed-row-item">
                            <h4>Status</h4>
                            ${data}
                        </div>
                    </div>
                </td>
            `;
        })
    .catch(error => console.error('Error loading timeline:', error));
    
    collapseButton.addEventListener('click', function(){
        collapsedRow.style.display = collapsedRow.style.display === 'none' ? 'table-row' : 'none';
        collapseButton.innerHTML = collapsedRow.style.display === 'none'? '<i class="fas fa-solid fa-eye-slash"></i>' : '<i class="fas fa-solid fa-eye"></i>';
    })
    actionButtons.appendChild(collapseButton);
    newRow.cells[5].appendChild(actionButtons);
    // Append the new row to the table body
    tableBody.appendChild(newRow);
    tableBody.appendChild(collapsedRow);
}

function newApplication(event){
    event.preventDefault(); 
    dialogHeader.innerText = "Add new application";
    fetch('basicform.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('basicform-container').innerHTML = data;
            // Set the current date as the default value for the submission date input field
            const submissionDateInput = document.getElementById('submission-date');
            if (submissionDateInput) {
                //const today = new Date().toISOString().split('T')[0]; -->
                //submissionDateInput.value = today;
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
                const day = String(today.getDate()).padStart(2, '0');
                const localDate = `${year}-${month}-${day}`;
                submissionDateInput.value = localDate;
            }
        })
        .catch(error => console.error('Error loading form:', error));
    dialog.showModal();
}

async function updateApplications(event){
    const basicForm = document.querySelector('#basicform-container form');
    if(basicForm){
        //Prevents form from submitting by default
        event.preventDefault();
        // Gather the field values
        const companyName = basicForm.querySelector('#company-name').value;
        const industryName = basicForm.querySelector('#industry-name').value;
        const jobTitle = basicForm.querySelector('#job-title-name').value;
        const jobType = basicForm.querySelector('#job-type').value;
        const submissionDate = basicForm.querySelector('#submission-date').value;
        const applicationUrl = basicForm.querySelector('#url-input').value;
        const confidenceScore = basicForm.querySelector('input[name="score"]:checked').value;

        const applicationData = {
            companyName: companyName,
            industryName: industryName,
            jobTitle: jobTitle,
            jobType: jobType,
            submissionDate: submissionDate,
            applicationUrl: applicationUrl,
            confidenceScore: confidenceScore
        }
        const newApplicationObj = new Application(applicationData);
        try {
            const res = await fetch(baseURL + 'applications',
                {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(newApplicationObj.toJSON())
                }
            );
            if(!res.ok){
                throw new Error('Network response was not ok');
            }
            // Repopulate the application list with the updated data
            loadData();
        }
        catch(error){
            console.error('There was a problem with the fetch operation:', error);
        }
    // Optionally, reset the form
    basicForm.reset();
    dialog.close();
    }
}

async function editApplication(id){
    try{
        const res = await fetch(baseURL + 'applications/' + id, {
            method: 'GET'
        })
        if(!res.ok){
            throw new Error('Network response was not ok');
        }
        const data = await res.json();
        return data;
    }
    catch(error){
        console.error('There was a problem with the fetch operation:', error);
    }
    
}

async function deleteApplication(id){
    try {
        const res = await fetch(baseURL + 'applications/' + id, {
            method: 'DELETE'
        });
        if (!res.ok) {
            throw new Error('Network response was not ok');
        }
        // Repopulate the application list with the updated data
        loadData();
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

async function deleteEdit(event){
    event.preventDefault();
    const item = event.target;
    const row = item.closest('tr');
    const id = row.getAttribute('data-id');
    // Grab the class list of the item
    if(item.classList[0]==='delete-btn'){
        deleteApplication(id);
        // then grab the parent element
        // const appItem = item.parentElement;
        // // Inserting an animation
        // appItem.classList.add('fall-animation');
        // // Once animation is over then remove
        // appItem.addEventListener('transitionend', function(){
        //     appItem.remove();
        // });
    }
    else if(item.classList[0]==='edit-btn'){
        const applicationData = await editApplication(id);
        editTarget = applicationData;
        dialog.showModal();
        dialogHeader.innerText = "Edit application";
        // Apply the values to the form
        fetch('basicform.html')
        .then(response => response.text())
        .then(data => {
            const basicForm = document.getElementById('basicform-container');
            basicForm.innerHTML = data;
            if (basicForm) {
                basicForm.querySelector('#company-name').value = applicationData.companyName;
                basicForm.querySelector('#industry-name').value = applicationData.industryName;
                basicForm.querySelector('#job-title-name').value = applicationData.jobTitle;
                basicForm.querySelector('#job-type').value = applicationData.jobType;
                basicForm.querySelector('#submission-date').value = applicationData.submissionDate;
                basicForm.querySelector('#url-input').value = applicationData.applicationUrl;
                basicForm.querySelector(`input[name="score"][value="${applicationData.confidenceScore.toLowerCase()}"]`).checked = true;
            }
        });
        
    }
}

async function submitEdit(event) {
    event.preventDefault();
    if (editTarget) {
        const basicForm = document.querySelector('#basicform-container form');
        if(basicForm){
            //Prevents form from submitting by default
            event.preventDefault();
            // Gather the field values
            const companyName = basicForm.querySelector('#company-name').value;
            const industryName = basicForm.querySelector('#industry-name').value;
            const jobTitle = basicForm.querySelector('#job-title-name').value;
            const jobType = basicForm.querySelector('#job-type').value;
            const submissionDate = basicForm.querySelector('#submission-date').value;
            const applicationUrl = basicForm.querySelector('#url-input').value;
            const confidenceScore = basicForm.querySelector('input[name="score"]:checked').value;

            editTarget = {
                ...editTarget,
                companyName: companyName,
                industryName: industryName,
                jobTitle: jobTitle,
                jobType: jobType,
                submissionDate: submissionDate,
                applicationUrl: applicationUrl,
                confidenceScore: confidenceScore
            }
            
            try {
                const res = await fetch(baseURL + 'applications/' + editTarget.id, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(editTarget)
                });
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                // Repopulate the application list with the updated data
                loadData();
            } catch (error) {
                console.error('There was a problem with the fetch operation:', error);
            }
        }
        editTarget = null;
        basicForm.reset();
        dialog.close();
    }
}


function sortApplicationsByDate(applications) {
    return applications.sort((a, b) => {
        const dateA = new Date(a.submissionDate);
        const dateB = new Date(b.submissionDate);
        return dateB - dateA; // Latest date first
    });
}

// Function to filter data based on the selected value
function filterData(filterValue) {
    console.log(`Filtering data for: ${filterValue}`);
    const today = new Date();
    let startDate;
    switch(filterValue) {
        case "": 
            loadData();
            break;
        case "today":
            startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()-1);
            break;
        case "week":
            startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
                break;
        case "month":
            startDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
            break;
        default:
            startDate = null;

    }
    console.log("startdate", startDate)
    if (startDate) {
        loadDataWithDateRange(startDate, today);
    }
}

// Function to load data with a date range filter
async function loadDataWithDateRange(startDate, endDate) {
    const res = await fetch(`${baseURL}applications`, {
        method: 'GET'
    });
    if (!res.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await res.json();
    const filteredData = data.filter(item => {
        const submissionDate = new Date(item.submissionDate);
        return submissionDate >= startDate && submissionDate <= endDate;
    });
    const sortedData = sortApplicationsByDate(filteredData);
    tableBody.innerHTML = '';
    sortedData.forEach((item) => {
        const applicationData = {
            id: item.id,
            companyName: item.companyName,
            industryName: item.industryName,
            jobTitle: item.jobTitle,
            jobType: item.jobType,
            submissionDate: item.submissionDate,
            applicationUrl: item.applicationUrl,
            confidenceScore: item.confidenceScore
        };
        const newApplicationObj = new Application(applicationData);
        addApplicationData(newApplicationObj);
    });
}
