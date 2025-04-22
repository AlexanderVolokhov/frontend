import Lazy from "lazy.js"

export const getAttributeVariant = (attr, success=true) => {
    if (attr.issues.length > 0) {
        if (Lazy(attr.issues).map(issue => issue.type).contains("error")) {
            return "danger"
        }
        return "warning"
    }
    return success ? "success" : ""
}

export const countIssuesInLinkDetails = (link, type) => {
    const from_issues = Lazy(link.from_link.issues).filter(issue => issue.type === type).size()
    const to_issues = Lazy(link.to_link.issues).filter(issue => issue.type === type).size()
    return from_issues + to_issues
}