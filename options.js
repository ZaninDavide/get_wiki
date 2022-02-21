let options_defaults = [
    {"name": "markdown", "default": true},
    {"name": "latex", "default": true},
    {"name": "markdown_link_title", "default": false},
]

let markdown_checkbox = document.getElementById("markdown_checkbox")
let latex_checkbox = document.getElementById("latex_checkbox")
let markdown_link_title = document.getElementById("markdown_link_title")
let form = document.getElementById("settings_form")

function onError(error) {
    console.log(`Error: ${error}`);
}

function restoreBool(bool, default_vaue) {
    if(bool === undefined || bool === null) {
        return default_vaue
    }else{
        return bool
    }
}

function restoreOptions() {
    browser.storage.sync.get().then(res => {
        // SHOW/HIDE MARKDOWN BUTTON
        markdown_checkbox.checked = restoreBool(res.markdown, options_defaults.markdown)
        // SHOW/HIDE LATEX BUTTON
        latex_checkbox.checked = restoreBool(res.latex, options_defaults.latex)
        // TURN TITLES INTO LINKS - MARKDOWN
        markdown_link_title.checked = restoreBool(res.markdown_link_title, options_defaults.markdown_link_title)
    }, onError);
}

function saveOptions(e) {
    e.preventDefault();
    browser.storage.sync.set({
      markdown: markdown_checkbox.checked,
      latex: latex_checkbox.checked,
      markdown_link_title: markdown_link_title.checked,
    });
}

document.addEventListener("DOMContentLoaded", restoreOptions);
form.addEventListener("submit", saveOptions);