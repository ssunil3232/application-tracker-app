// Application.js

class Application {
    constructor({id, companyName, industryName, jobTitle, jobType, submissionDate, applicationUrl, confidenceScore, status = 'applied'}) {
        this.id = id;
        this.companyName = companyName;
        this.industryName = industryName;
        this.jobTitle = jobTitle;
        this.jobType = jobType;
        this.submissionDate = submissionDate;
        this.applicationUrl = applicationUrl;
        this.confidenceScore = confidenceScore;
        this.status = status;
    }

    toJSON() {
        return {
            id: this.id,
            companyName: this.companyName,
            industryName: this.industryName,
            jobTitle: this.jobTitle,
            jobType: this.jobType,
            submissionDate: this.submissionDate,
            applicationUrl: this.applicationUrl,
            confidenceScore: this.confidenceScore,
            status: this.status
        };
    }
}

export default Application;