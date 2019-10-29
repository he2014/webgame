export function safeActiveElement(document) {
    let activeElement

    // Support: IE 9 only
    // IE9 throws an "Unspecified error" accessing document.activeElement from an <iframe>
    try {
        activeElement = document.activeElement
    }catch(error) {
        activeElement = document.body
    }

    // Support: IE 9 - 11 only
    // IE may return null instead of an element
    // Interestingly, this only seems to occur when NOT in an iframe
    if(!activeElement) {
        activeElement = document.body
    }

    // Support: IE 11 only
    // IE11 returns a seemingly empty object in some cases when accessing
    // document.activeElement from an <iframe>
    if(!activeElement.nodeName) {
        activeElement = document.body
    }

    return activeElement
}