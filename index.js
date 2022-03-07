let options_defaults = [
    {"name": "markdown", "default": true},
    {"name": "latex", "default": true},
    {"name": "markdown_link_title", "default": false},
]

let options = {} 

function getOption(option_name) {
    if(options[option_name] !== null && options[option_name] !== undefined) {
        return options[option_name]
    }else{
        return options_defaults[option_name]
    }
}

function inline_to_md(p) {
    let md = []
    Array.from(p.childNodes).forEach(el => {
        switch (el.nodeName) {
            case "#text":
                md.push(`${el.data}`)
                break;
            case "A":
                md.push(`${el.innerText}`)
                break;
            case "SPAN":
                if(el.className === "mwe-math-element"){
                    // inline math
                    let math = el.firstChild.firstChild.attributes.getNamedItem("alttext").value
                    math = math.slice(15, math.length - 1)
                    math = math.trim()
                    md.push(`\$${math}\$`)
                }else{
                    // generic span
                    md.push(`${el.innerText}`)
                }
                break;
            case "B":
                // doean't work with nested things TODO
                md.push(`${el.innerText}`)
                break;
            case "I":
                md.push(`${el.innerText}`)
                break;
            default:
                break;
        }
    })
    return md.join("")
}

function paragraph_to_md(par) {
    let md = []
    par.forEach(el => {
        switch (el.nodeName) {
            case "H1":
                let title = Array.from(el.childNodes).filter(c => c.textContent)[0].textContent
                if(getOption("markdown_link_title")){
                    let url = window.location.href.split("?")[0].split("#")[0]
                    let link = url + "#" + title.replace(/\s/g, "_")
                    md.push(`# [${title}](${link})`)
                }else{
                    md.push(`# ${title}`)
                }
                break;
            case "H2":
                let title2 = Array.from(el.childNodes).filter(c => c.textContent)[0].textContent
                if(getOption("markdown_link_title")){
                    let url2 = window.location.href.split("?")[0].split("#")[0]
                    let link2 = url2 + "#" + title2.replace(/\s/g, "_")
                    md.push(`## [${title2}](${link2})`)
                }else{
                    md.push(`## ${title2}`)
                }
                break;
            case "H3":
                let title3 = Array.from(el.childNodes).filter(c => c.textContent)[0].textContent
                if(getOption("markdown_link_title")){
                    let url3 = window.location.href.split("?")[0].split("#")[0]
                    let link3 = url3 + "#" + title3.replace(/\s/g, "_")
                    md.push(`### [${title3}](${link3})`)
                }else{
                    md.push(`### ${title3}`)
                }
                break;
            case "H4":
                let title4 = Array.from(el.childNodes).filter(c => c.textContent)[0].textContent
                if(getOption("markdown_link_title")){
                    let url4 = window.location.href.split("?")[0].split("#")[0]
                    let link4 = url4 + "#" + title4.replace(/\s/g, "_")
                    md.push(`#### [${title4}](${link4})`)
                }else{
                    md.push(`#### ${title4}`)
                }
                break;
            case "P":
                md.push(`${inline_to_md(el).trim()}`)
                break;
            case "DL":
                // every child is a math block
                let blocks = Array.from(el.children)
                for(let block of blocks) {
                    let block_math = ""
                    for(let math of Array.from(block.childNodes)){
                        if(math.nodeName === "SPAN"){
                            let math_str = math.firstChild.firstChild.attributes.getNamedItem("alttext").value
                            math_str = math_str.slice(15, math_str.length - 1)
                            block_math += math_str
                        }else if(math.nodeName === "#text") {
                            block_math += `\\text{${math.textContent}}`
                        }
                    }
                    md.push(`\$\$\n${block_math}\n\$\$`)
                }
                break;
            case "UL":
                md.push(Array.from(el.children).map(li => {
                    return "- " + inline_to_md(li)
                }).join("\n"))
                break;
            case "OL":
                md.push(Array.from(el.children).map((li, id) => {
                    return (id+1).toString() + ". " + inline_to_md(li)
                }).join("\n"))
                break;
            default:
                break;
        }
    })
    return md.join("\n\n")
}

function escape(str){
    return str.replace(/\\/, "\\\\")
}

function inline_to_latex(p) {
    let md = []
    Array.from(p.childNodes).forEach(el => {
        switch (el.nodeName) {
            case "#text":
                md.push(`${escape(el.data)}`)
                break;
            case "A":
                md.push(`${escape(el.innerText)}`)
                break;
            case "SPAN":
                if(el.className === "mwe-math-element"){
                    // inline math
                    let math = el.firstChild.firstChild.attributes.getNamedItem("alttext").value
                    math = math.slice(15, math.length - 1)
                    math = math.trim()
                    md.push(`\$${math}\$`)
                }else{
                    // generic span
                    md.push(`${escape(el.innerText)}`)
                }
                break;
            case "B":
                // doean't work with nested things TODO
                md.push(`\\textbf{${escape(el.innerText)}}`)
                break;
            case "I":
                md.push(`\\textit{${escape(el.innerText)}}`)
                break;
            default:
                break;
        }
    })
    return md.join("")
}

function paragraph_to_latex(par) {
    let md = []
    par.forEach(el => {
        switch (el.nodeName) {
            case "H1":
                md.push(`\\section{${el.childNodes[0].textContent}}`)
                break;
            case "H2":
                md.push(`\\section{${escape(el.childNodes[0].textContent)}}`)
                break;
            case "H3":
                md.push(`\\subsection{${escape(el.childNodes[0].textContent)}}`)
                break;
            case "H4":
                md.push(`\\subsubsection{${escape(el.childNodes[0].textContent)}}`)
                break;
            case "P":
                md.push(`${inline_to_latex(el).trim()}`)
                break;
            case "DL":
                // every child is a math block
                let blocks = Array.from(el.children)
                for(let block of blocks) {
                    let block_math = ""
                    for(let math of Array.from(block.childNodes)){
                        if(math.nodeName === "SPAN"){
                            let math_str = math.firstChild.firstChild.attributes.getNamedItem("alttext").value
                            math_str = math_str.slice(15, math_str.length - 1)
                            block_math += math_str
                        }else if(math.nodeName === "#text") {
                            block_math += `\\text{${math.textContent}}`
                        }
                    }
                    md.push(`\\[ ${block_math} \\]`)
                }
                break;
            case "UL":
                md.push("\\begin{itemize}\n" + Array.from(el.children).map(li => {
                    return "\\item{" + inline_to_latex(li) + "}"
                }).join("\n") + "\n\\end{itemize}")
                break;
            case "OL":
                md.push("\\begin{enumerate}\n" + Array.from(el.children).map((li, id) => {
                    return "\\item{" + inline_to_latex(li) + "}"
                }).join("\n") + "\n\\end{enumerate}")
                break;
            default:
                break;
        }
    })
    return md.join("\n\n")
}

browser.storage.sync.get().then(res => {
    // READ EXTENSION PREFERENCES
    options = res

    // INSERT COPY BUTTONS

    let children = Array.from(document.getElementById("mw-content-text").childNodes[0].children) 

    let paragraphs = [[]]

    let main_header = document.getElementById("firstHeading")
    paragraphs[0].push(main_header)

    children.forEach(child => {
        if(child.nodeName === "H2" || child.nodeName === "H3" || child.nodeName === "H4") {
            paragraphs.push([])
        }else if(
            child.nodeName === "STYLE" ||
            child.nodeName === "DIV" ||
            child.nodeName === "TABLE"
        ){
            return false;
        }
        if(paragraphs.length > 0){
            paragraphs[paragraphs.length - 1].push(child)
        }
    });


    // main paragraph
    let main = paragraphs.shift()

    let mod_main = document.createElement("span")
    mod_main.classList.add("mw-editsection")    

    let main_open_braket = document.createElement("span")
    main_open_braket.classList.add("mw-editsection-bracket")
    main_open_braket.innerText = "["
    main_open_braket.style = "margin-right: 0.25em;"

    let main_copy_button = document.createElement("a")
    main_copy_button.appendChild(document.createTextNode("markdown"))
    main_copy_button.addEventListener("click", e => {
        console.log("Started coping...")
        copyTextToClipboard(
            paragraph_to_md(main),
            e.shiftKey
        )
    })

    let main_divider = document.createElement("span")
    main_divider.classList.add("mw-editsection-divider")
    main_divider.innerText = " | "

    let main_latex_button = document.createElement("a")
    main_latex_button.appendChild(document.createTextNode("latex"))
    main_latex_button.addEventListener("click", e => {
        console.log("Started coping...")
        copyTextToClipboard(
            paragraph_to_latex(main),
            e.shiftKey
        )
    })

    let main_close_braket = document.createElement("span")
    main_close_braket.classList.add("mw-editsection-bracket")
    main_close_braket.innerText = "]"
    main_close_braket.style = "margin-left: 0.25em;"

    let site_sub = document.getElementById("siteSub")

    if(getOption("markdown") && getOption("latex")){
        mod_main.appendChild(main_open_braket)
        mod_main.appendChild(main_copy_button)
        mod_main.appendChild(main_divider)
        mod_main.appendChild(main_latex_button)
        mod_main.appendChild(main_close_braket)
        site_sub.appendChild(mod_main)
    }else if (getOption("markdown")){
        mod_main.appendChild(main_open_braket)
        mod_main.appendChild(main_copy_button)
        mod_main.appendChild(main_close_braket)
        site_sub.appendChild(mod_main)
    }else if (getOption("latex")){
        mod_main.appendChild(main_open_braket)
        mod_main.appendChild(main_latex_button)
        mod_main.appendChild(main_close_braket)
        site_sub.appendChild(mod_main)
    }


    // all other paragraphs
    paragraphs.forEach(p => {
        // p[0] = paragraph header
        const editable = p[0].children[p[0].children.length - 1].classList.contains("mw-editsection")
        let mod_section;

        if(editable) {
            // remove "]""
            mod_section = p[0].childNodes[p[0].childNodes.length - 1]
            mod_section.removeChild(mod_section.childNodes[mod_section.childNodes.length - 1])
        }else{
            mod_section = document.createElement("span")
            mod_section.classList.add("mw-editsectionnnnn")
            mod_section.style = "font-size: small;font-weight: normal;margin-left: 1em;vertical-align: baseline;line-height: 1em;font-family: sans-serif;"

            let open_braket = document.createElement("span")
            open_braket.classList.add("mw-editsection-bracket")
            open_braket.innerText = "["

            mod_section.appendChild(open_braket)
        }
        
        let divider = document.createElement("span")
        divider.classList.add("mw-editsection-divider")
        divider.innerText = " | "

        let copy_button = document.createElement("a")
        copy_button.appendChild(document.createTextNode("markdown"))
        copy_button.addEventListener("click", e => {
            console.log("Started coping...")
            copyTextToClipboard(
                paragraph_to_md(p),
                e.shiftKey
            )
        })

        let divider2 = document.createElement("span")
        divider2.classList.add("mw-editsection-divider")
        divider2.innerText = " | "

        let latex_button = document.createElement("a")
        latex_button.appendChild(document.createTextNode("latex"))
        latex_button.addEventListener("click", e => {
            console.log("Started coping...")
            copyTextToClipboard(
                paragraph_to_latex(p),
                e.shiftKey
            )
        })

        let end_braket = document.createElement("span")
        end_braket.classList.add("mw-editsection-bracket")
        end_braket.innerText = "]"

        // ADD BUTTONS TO THE PARAGRAPH'S EDIT SECTION
        if(getOption("markdown") && getOption("latex")){
            if(editable) mod_section.appendChild(divider)
            mod_section.appendChild(copy_button)
            mod_section.appendChild(divider2)
            mod_section.appendChild(latex_button)
            mod_section.appendChild(end_braket)
            if(!editable) p[0].appendChild(mod_section)
        }else if(getOption("markdown")){
            if(editable) mod_section.appendChild(divider)
            mod_section.appendChild(copy_button)
            mod_section.appendChild(end_braket)
            if(!editable) p[0].appendChild(mod_section)
        }else if(getOption("latex")){
            if(editable) mod_section.appendChild(divider)
            mod_section.appendChild(latex_button)
            mod_section.appendChild(end_braket)
            if(!editable) p[0].appendChild(mod_section)
        }
        
    })
})