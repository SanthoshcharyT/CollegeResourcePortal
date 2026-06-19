package model;

import java.sql.Timestamp;

public class Resource {
    private int resourceId;
    private String title;
    private String description;
    private String subject;
    private int semester; // Changed to int
    private String branch;
    private String resourceType; // ENUM: 'NOTES','QUESTION_PAPER','LAB_MANUAL'
    private String filePath;
    private String status; // 'PENDING','APPROVED','REJECTED'
    private int uploadedBy; // Maps to uploaded_by
    private Timestamp uploadDate;

    // Transient field for display, not in DB.
    // We can extract filename from filePath or title.
    private String fileName;

    // Transient fields for Frontend display (joined from User table)
    private String uploaderName;
    private String uploaderEmail;

    public String getUploaderName() {
        return uploaderName;
    }

    public void setUploaderName(String uploaderName) {
        this.uploaderName = uploaderName;
    }

    public String getUploaderEmail() {
        return uploaderEmail;
    }

    public void setUploaderEmail(String uploaderEmail) {
        this.uploaderEmail = uploaderEmail;
    }

    public int getResourceId() {
        return resourceId;
    }

    public void setResourceId(int resourceId) {
        this.resourceId = resourceId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public int getSemester() {
        return semester;
    }

    public void setSemester(int semester) {
        this.semester = semester;
    }

    public String getBranch() {
        return branch;
    }

    public void setBranch(String branch) {
        this.branch = branch;
    }

    public String getResourceType() {
        return resourceType;
    }

    public void setResourceType(String resourceType) {
        this.resourceType = resourceType;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getUploadedBy() {
        return uploadedBy;
    }

    public void setUploadedBy(int uploadedBy) {
        this.uploadedBy = uploadedBy;
    }

    public Timestamp getUploadDate() {
        return uploadDate;
    }

    public void setUploadDate(Timestamp uploadDate) {
        this.uploadDate = uploadDate;
    }

    // Helper getter for fileName derived from path if needed
    public String getFileName() {
        if (filePath != null && fileName == null) {
            return new java.io.File(filePath).getName();
        }
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }
}
