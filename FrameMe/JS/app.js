document.addEventListener("DOMContentLoaded", function () {
    const menu = document.querySelector('.menu');
    const side = document.querySelector('aside');

    // Toggle menu and side panel visibility
    menu.addEventListener('click', function () {
        menu.classList.toggle('active');
        side.classList.toggle('active');
    });

    // Hide side panel when clicking outside of it
    document.addEventListener('click', function (event) {
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
    let connect = document.querySelector('.connect');
    let pics = ["./Assets/models/pic1.png", "./Assets/architecture/pic1.png", "./Assets/nature/pic1.png"];

    // Set About section as active by default
    navAbout.style.textDecoration = "underline";
    about.classList.add('active');
    gallery.classList.remove('active');
    connect.classList.remove('active');


    // Function to scroll to a section and set its top position
    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Event listener for the About section
    navAbout.addEventListener("click", function () {
        if (!about.classList.contains('active')) {
            gallery.classList.remove('active');
            connect.classList.remove('active');
            about.classList.add('active');
            navAbout.style.textDecoration = "underline";
            navGallery.style.textDecoration = "none";
            navConnect.style.textDecoration = "none";

            // Scroll to the About section
           scrollToTop();
        }
    });

    // Event listener for the Gallery section
    navGallery.addEventListener("click", function () {
        if (!gallery.classList.contains('active')) {
            gallery.classList.add('active');
            connect.classList.remove('active');
            about.classList.remove('active');
            navGallery.style.textDecoration = "underline";
            navAbout.style.textDecoration = "none";
            navConnect.style.textDecoration = "none";

            gallery.innerHTML = ""; // Clear previous gallery content

            // HTML content with descriptions
            let modelText = `
                <div class="gallerySection">
                    <h2>Gallery of Human Expression: A Dive into the Beauty of Motion</h2><br>
                    <h3>Step into a gallery where the human body becomes art in motion.</h3><br>
                    <p>Here, every image captures the fluidity, grace, and raw emotion of the human form. Models are portrayed in dynamic poses, showcasing the natural movements, lines, and curves of the body. From delicate gestures to powerful stances.</p>
                    <p>Dive into a world where the beauty of a moment speaks louder than words.</p>
                </div>`;

            let archText = `
                <div class="gallerySection">
                    <h2>Architectural Wonders: A Journey Through Design</h2><br>
                    <h3>Dive into the world of stunning architecture where each structure tells its own story.</h3><br>
                    <p>This section captures the beauty of design, symmetry, and the artistic blend of old and new. From towering skyscrapers to historic landmarks, explore the interplay of light and shadow that brings these architectural wonders to life.</p>
                </div>`;

            let natureText = `
                <div class="gallerySection">
                    <h2>The Essence of Nature: Capturing the Wild and Serene</h2><br>
                    <h3>Explore the breathtaking beauty of nature in its most serene and wild moments.</h3><br>
                    <p>This section showcases the vivid colors, textures, and forms found in landscapes, flora, and fauna. Each photograph celebrates the raw, unedited splendor of the natural world, inviting you to see the intricate details that often go unnoticed.</p>
                </div>`;

            // Descriptions and links for the images
            let descriptions = [modelText, archText, natureText];
            let links = ["model.html", "architecture.html", "nature.html"];

            // Populate gallery with images and descriptions
            pics.forEach(function (pic, index) {
                let wrapper = document.createElement("div");
                wrapper.classList.add("galleryOption");

                let img = document.createElement("img");
                img.src = pic;
                img.classList.add("createdImg");
                img.style.marginRight = "20px";

                let textWrapper = document.createElement("div");
                textWrapper.style.display = "flex";
                textWrapper.style.flexDirection = "column";
                textWrapper.classList.add("description");
                textWrapper.innerHTML = descriptions[index] || "Description not available.";

                let pageLink = document.createElement("a");
                pageLink.href = links[index] || "#";
                pageLink.textContent = "Explore...";
                pageLink.style.textDecoration = "underline";
                pageLink.style.marginTop = "10px";
                pageLink.style.color = "blue";

                textWrapper.appendChild(pageLink);
                wrapper.appendChild(img);
                wrapper.appendChild(textWrapper);
                gallery.appendChild(wrapper);
            });

            scrollToTop();
        }
    });

    // Event listener for the Connect section
    navConnect.addEventListener("click", function () {
        if (!connect.classList.contains('active')) {
            gallery.classList.remove('active');
            connect.classList.add('active');
            about.classList.remove('active');
            navConnect.style.textDecoration = "underline";
            navAbout.style.textDecoration = "none";
            navGallery.style.textDecoration = "none";

            scrollToTop();
        }
    });

    // Manage backHead and backNature animation classes
    $(document).ready(function () {
        $("#gallery").click(function () {
            $(".backHead, .backNature").addClass("active");
        });
        $("#about, #connect").click(function () {
            $(".backHead, .backNature").removeClass("active");
        });
        $("#connect").click(function () {
            $(".backHead").addClass("active");
        });
    });

    // Sticky navbar on scroll
    const navbar = document.querySelector('.navbar');
    const navbarOffsetTop = navbar.offsetTop;

    window.addEventListener('scroll', function () {
        if (window.scrollY >= navbarOffsetTop) {
            navbar.classList.add('navbar-fixed');
        } else {
            navbar.classList.remove('navbar-fixed');
        }
    });
});
