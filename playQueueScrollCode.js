function scrollToCurrentPlayQueueItem(){
    let playQueueItems = document.querySelector(".playQueueItems--8CdgD")
    let items = [...playQueueItems.querySelector(".ReactVirtualized__Grid__innerScrollContainer").children]
    let scrollDown = false

    for(let item of items){
        if(parseInt(item.style.height) > 59){
        playQueueItems.scrollTop = parseInt(item.style.top)
        return
        }
        if(item.querySelector(".containerPriorityHistory--1s410") != null){
        scrollDown = true
        }
    }
    if(scrollDown){
        playQueueItems.scrollTop = parseInt(items[items.length - 1].style.top)
    }else{
        playQueueItems.scrollTop -= playQueueItems.getBoundingClientRect().height
    }

    setTimeout(scrollToCurrentPlayQueueItem, 10)
}

function createToCurrentButton(){
    let toCurrentButton = document.createElement("button")
    toCurrentButton.innerText = "Currently Playing"
    toCurrentButton.classList.add("button--32qMf")
    toCurrentButton.classList.add("sidebar-section--3C8Oy")

    let header = document.querySelector(".header--3JAy1")
    let saveButton = header.querySelector("button")

    header.insertBefore(toCurrentButton, saveButton)

    toCurrentButton.addEventListener("click", () => {
        scrollToCurrentPlayQueueItem()
    })
}

window.onload = function () {
    setTimeout(() => {
        let observer = new MutationObserver(mutations => {
        if(mutations[0].target.classList.contains("containerIsOpen--2Dlrq")){
            setTimeout(() => {
            scrollToCurrentPlayQueueItem()
            createToCurrentButton()
            }, 50)
        }
        })
        
        observer.observe(document.querySelector("#playQueueSidebar"), {attributes: true})
    }, 2000)
}