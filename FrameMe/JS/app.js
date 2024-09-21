document.addEventListener("DOMContentLoaded", function() {
    const menu = document.querySelector('.menu');
    const side = document.querySelector('aside');

    menu.addEventListener('click', function() {
        menu.classList.toggle('active');
        side.classList.toggle('active');
    });

    document.addEventListener('click', function(event) {
        if (!side.contains(event.target) && !menu.contains(event.target)) {
            menu.classList.remove('active');
            side.classList.remove('active');
        }
    });

    let navAbout = document.querySelector('#about');
    let navGallery = document.querySelector('#gallery');
    let navConnect = document.querySelector('#connect');
    let about = document.querySelector('.about');
    let gallery = document.querySelector('.gallery');
    let subGallery = document.querySelector('.subGallery');
    let connect = document.querySelector('.connect');
    let pics = ["./Assets/models/pic1.png", "./Assets/architecture/pic1.png","./Assets/nature/pic1.png"];

    navAbout.style.textDecoration = "underline";
    about.style.display = "flex";

    navAbout.addEventListener("click", function (){
        gallery.style.display = "none";
        connect.style.display = "none";
        about.style.display = "flex";
        navAbout.style.textDecoration = "underline";
        navGallery.style.textDecoration = "none";
        navConnect.style.textDecoration = "none";
    });

    navGallery.addEventListener("click", function (){
        gallery.style.display = "flex";
        connect.style.display = "none";
        about.style.display = "none";
        navGallery.style.textDecoration = "underline";
        navAbout.style.textDecoration = "none";
        navConnect.style.textDecoration = "none";
    
        subGallery.innerHTML = "";
    
        // Labels for the images
        let labels = ["Model", "Architecture", "Nature"];
    let links = ["model.html", "architecture.html", "nature.html"];

    pics.forEach(function(pic, index) {
        // Create a link wrapper
        let link = document.createElement("a");
        link.href = links[index] || "#";
        link.style.textDecoration = "none"; // Removes default underline for links
        link.target = "_blank"; // Opens the link in a new tab

        // Create a wrapper div for the image and text
        let wrapper = document.createElement("div");
        wrapper.style.display = "flex";
        wrapper.style.flexDirection = "column";
        wrapper.style.alignItems = "center";
        wrapper.style.margin = "10px";

        // Create the image element
        let img = document.createElement("img");
        img.src = pic;
        img.classList.add("createdImg");

        // Create the text element
        let text = document.createElement("div");
        text.textContent = labels[index] || "Image";
        text.classList.add("textLabel");

        // Append the image and text to the wrapper
        wrapper.appendChild(img);
        wrapper.appendChild(text);

        // Append the wrapper to the link
        link.appendChild(wrapper);

        // Append the link to the gallery
        subGallery.appendChild(link);
    });
});
    

    navConnect.addEventListener("click", function (){
        gallery.style.display = "none";
        connect.style.display = "flex";
        about.style.display = "none";
        navConnect.style.textDecoration = "underline";
        navAbout.style.textDecoration = "none";
        navGallery.style.textDecoration = "none";
    });
});

$(document).ready(function() {
    $("#gallery").click(function() {
        $(".backHead, .backNature").addClass("active");
    });
    $("#about, #connect").click(function() {
        $(".backHead, .backNature").removeClass("active");
    });
    $("#connect").click(function() {
        $(".backHead").addClass("active");
    });
});
