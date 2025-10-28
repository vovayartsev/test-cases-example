// Or as a combined solution that checks both on load and on change:
function checkForBuilder() {
    if (window.location.hash === '#builder') {
        alert('Builder');
    }
}

// Check on page load
checkForBuilder();

// Check when hash changes
window.addEventListener('hashchange', checkForBuilder);
