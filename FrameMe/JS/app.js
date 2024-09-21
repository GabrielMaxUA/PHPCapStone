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
    let gallery = document.querySelector('.gallery')
    let galleryImg = document.querySelector('.galleryImg')
    let connect = document.querySelector('.connect');
    let pics = ["./Assets/models/pic1.png", "./Assets/architecture/pic1.png","./Assets/nature/pic1.png"];

    navAbout.style.textDecoration = "underline";
    about.style.display = "flex";

    navAbout.addEventListener("click", function (){
        gallery.classList.remove('active');
        connect.style.display = "none";
        about.style.display = "flex";
        navAbout.style.textDecoration = "underline";
        navGallery.style.textDecoration = "none";
        navConnect.style.textDecoration = "none";
    });

    navGallery.addEventListener("click", function () {
        gallery.classList.toggle("active");
        connect.style.display = "none";
        about.style.display = "none";
        navGallery.style.textDecoration = "underline";
        navAbout.style.textDecoration = "none";
        navConnect.style.textDecoration = "none";
    
        gallery.innerHTML = "";
    
        // HTML content with proper formatting and headings
        let modelText = `
            <div class="gallerySection">
                <h2>Gallery of Human Expression: A Dive into the Beauty of Motion</h2><br>
                <h3>Step into a gallery where the human body becomes art in motion.</h3><br>
                <p>
                    Here, every image captures the fluidity, grace, and raw emotion of the human form. Models are portrayed in dynamic poses, showcasing the natural 
                    movements, lines, and curves of the body. From delicate gestures to powerful stances. 
                </p>
                <p>
                    Dive into a world where the beauty of a moment speaks louder than words.
                </p>
            </div>`;
    
        let archText = `
            <div class="gallerySection">
                <h2>Architectural Wonders: A Journey Through Design</h2><br>
                <h3>Dive into the world of stunning architecture where each structure tells its own story.</h3><br>
                <p>
                    This section captures the beauty of design, symmetry, and the artistic blend of old and new. From towering skyscrapers to historic landmarks, explore the interplay of light and shadow that brings these architectural wonders to life.
                </p>
            </div>`;
    
        let natureText = `
            <div class="gallerySection">
                <h2>The Essence of Nature: Capturing the Wild and Serene</h2><br>
                <h3>Explore the breathtaking beauty of nature in its most serene and wild moments.</h3><br>
                <p>
                    This section showcases the vivid colors, textures, and forms found in landscapes, flora, and fauna. Each photograph celebrates the raw, unedited splendor of the natural world, inviting you to see the intricate details that often go unnoticed.
                </p>
            </div>`;
    
        // Descriptions for the images
        let descriptions = [modelText, archText, natureText];
        let links = ["model.html", "architecture.html", "nature.html"];
    
        pics.forEach(function (pic, index) {
            // Create a wrapper div for the image and text
            let wrapper = document.createElement("div");
            wrapper.classList.add("galleryOption");
            
    
            // Create the image element
            let img = document.createElement("img");
            img.src = pic;
            img.classList.add("createdImg");
            img.style.marginRight = "20px"; // Add space between image and text
    
            // Create a text wrapper div for description and link
            let textWrapper = document.createElement("div");
            textWrapper.style.display = "flex";
            textWrapper.style.flexDirection = "column";
            textWrapper.classList.add("description");
    
            // Insert the formatted HTML description into the text wrapper
            textWrapper.innerHTML = descriptions[index] || "Description not available.";
    
            // Create the link element for navigation
            let pageLink = document.createElement("a");
            pageLink.href = links[index] || "#";
            pageLink.textContent = "Explore...";
            pageLink.style.textDecoration = "underline";
            pageLink.style.marginTop = "10px"; // Adds space between the text and the link
            pageLink.style.color = "blue"; // Styling for link
    
            // Append the link to the text wrapper
            textWrapper.appendChild(pageLink);
    
            // Append the image and textWrapper to the main wrapper
            wrapper.appendChild(img);
            wrapper.appendChild(textWrapper);
    
            // Append the wrapper to the gallery
            gallery.appendChild(wrapper);
        });
    });
    

    

    navConnect.addEventListener("click", function (){
        gallery.classList.remove('active');
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
