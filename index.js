let children = Array.from(document.getElementById("mw-content-text").childNodes[0].children) 

let paragraphs = [[]]

let main_header = document.getElementById("firstHeading")
paragraphs[0].push(main_header)

children.forEach(child => {
    if(child.nodeName === "H2" || child.nodeName === "H3") {
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
                md.push(`# ${el.childNodes[0].textContent}`)
                break;
            case "H2":
                md.push(`## ${el.childNodes[0].textContent}`)
                break;
            case "H3":
                md.push(`### ${el.childNodes[0].textContent}`)
                break;
            case "P":
                md.push(`${inline_to_md(el).trim()}`)
                break;
            case "DL":
                // math block
                let math = el.firstChild.firstChild.firstChild.firstChild.attributes.getNamedItem("alttext").value
                math = math.slice(15, math.length - 1)
                md.push(`\$\$\n${math}\n\$\$`)
                break;
            case "UL":
                md.push(Array.from(el.children).map(li => {
                    return "- " + inline_to_md(li)
                }).join("\n"))
                break;
            default:
                break;
        }
    })
    return md.join("\n")
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
            case "P":
                md.push(`${inline_to_latex(el).trim()}`)
                break;
            case "DL":
                // math block
                let math = el.firstChild.firstChild.firstChild.firstChild.attributes.getNamedItem("alttext").value
                math = math.slice(15, math.length - 1)
                md.push(`\\[ ${math} \\]`)
                break;
            case "UL":
                md.push("\\begin{itemize}\n" + Array.from(el.children).map(li => {
                    return "\\item{" + inline_to_latex(li) + "}"
                }).join("\n") + "\n\\end{itemize}")
                break;
            default:
                break;
        }
    })
    return md.join("\n\n")
}


// main paragraph
let main = paragraphs.shift()

let mod_main = document.createElement("span")
mod_main.classList.add("mw-editsection")    

let main_open_braket = document.createElement("span")
main_open_braket.classList.add("mw-editsection-bracket")
main_open_braket.innerText = "["

let main_copy_button = document.createElement("a")
main_copy_button.appendChild(document.createTextNode("markdown"))
main_copy_button.addEventListener("click", () => {
    console.log("Copied!")
    copyTextToClipboard(
        paragraph_to_md(main)
    )
})

let main_divider = document.createElement("span")
main_divider.classList.add("mw-editsection-divider")
main_divider.innerText = " | "

let main_latex_button = document.createElement("a")
main_latex_button.appendChild(document.createTextNode("latex"))
main_latex_button.addEventListener("click", () => {
    console.log("Copied!")
    copyTextToClipboard(
        paragraph_to_latex(main)
    )
})

let main_close_braket = document.createElement("span")
main_close_braket.classList.add("mw-editsection-bracket")
main_close_braket.innerText = "]"

let site_sub = document.getElementById("siteSub")
mod_main.appendChild(main_open_braket)
mod_main.appendChild(main_copy_button)
mod_main.appendChild(main_divider)
mod_main.appendChild(main_latex_button)
mod_main.appendChild(main_close_braket)
site_sub.appendChild(mod_main)


// all other paragraphs
paragraphs.forEach(p => {
    // p[0] = paragraph header   [1] = modify paragraph selection
    let mod_section = p[0].childNodes[p[0].childNodes.length - 1]
    
    // remove "]""
    mod_section.removeChild(mod_section.childNodes[mod_section.childNodes.length - 1]);
    
    let divider = document.createElement("span")
    divider.classList.add("mw-editsection-divider")
    divider.innerText = " | "

    let copy_button = document.createElement("a")
    copy_button.appendChild(document.createTextNode("markdown"))
    copy_button.addEventListener("click", () => {
        console.log("Copied!")
        copyTextToClipboard(
            paragraph_to_md(p)
        )
    })

    let divider2 = document.createElement("span")
    divider2.classList.add("mw-editsection-divider")
    divider2.innerText = " | "

    let latex_button = document.createElement("a")
    latex_button.appendChild(document.createTextNode("latex"))
    latex_button.addEventListener("click", () => {
        console.log("Copied!")
        copyTextToClipboard(
            paragraph_to_latex(p)
        )
    })

    let end_braket = document.createElement("span")
    end_braket.classList.add("mw-editsection-bracket")
    end_braket.innerText = "]"

    mod_section.appendChild(divider)
    mod_section.appendChild(copy_button)
    mod_section.appendChild(divider2)
    mod_section.appendChild(latex_button)
    mod_section.appendChild(end_braket)
})