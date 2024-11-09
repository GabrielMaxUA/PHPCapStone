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
    
        // Highlight active link in navbar
        const currentLocation = window.location.pathname; // Get the path only
        const links = document.querySelectorAll('.navbar a');

        links.forEach(link => {
            if (currentLocation.includes(link.pathname)) {
                link.classList.add('active'); // Add active class if the current path contains the link's path
            }
            else {
                link.style.textDecoration = 'none'; // Remove underline by setting text-decoration to none
            }
        });

        
});


function addFileInput() {
  const mainContainer = document.querySelector('#inputFieldsContainer');

  // Create a new div container for the new set of inputs
  const newContainer = document.createElement('div');
  newContainer.className = 'fileInputContainer';

  // Create the label and input for the product price
  const priceLabel = document.createElement('label');
  priceLabel.textContent = 'Product Price: ';
  const priceInput = document.createElement('input');
  priceInput.type = 'text';
  priceInput.name = 'productPrice';
  priceInput.required = true;

  // Create the label and input for the product image
  const imageLabel = document.createElement('label');
  imageLabel.textContent = ' Choose Image: ';
  const imageInput = document.createElement('input');
  imageInput.type = 'file';
  imageInput.name = 'productImage[]';
  imageInput.accept = 'image/*';
  imageInput.required = true;

  // Append all elements to the new container div
  newContainer.appendChild(priceLabel);
  newContainer.appendChild(priceInput);
  newContainer.appendChild(imageLabel);
  newContainer.appendChild(imageInput);

  // Append the new container div to the main form container
  mainContainer.appendChild(newContainer);
};
