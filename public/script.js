    const offCanvasNavbar = globalThis.document.getElementById('offcanvasNavbar');

    globalThis.document.querySelectorAll('.navbar-toggler').forEach(button => {
      button.addEventListener('click', function(e) {
        const nav = this.getAttribute('data-bs-target');
        // console.log(nav, e.target);

        const id = '#' + offCanvasNavbar.getAttribute('id');

        if (nav == id) {
          offCanvasNavbar.style.display = 'block';
        }

        // console.log(id);
      });
    });

    const scrollToTopBtn = document.getElementById("scrollToTopBtn");

    scrollToTopBtn.addEventListener("click", () => {
      // Scroll to the top of the page smoothly
      window.scrollTo({
          top: 0,
          behavior: "smooth"
      });
    });

    globalThis.document.addEventListener('DOMContentLoaded', () => {
      const enOuterBtn = globalThis.document.querySelector(".en-button");
      const frOuterBtn = globalThis.document.querySelector(".ru-button");
      const enBtn = globalThis.document.querySelector("#enBtn");
      const frBtn = globalThis.document.querySelector("#frBtn");
      const lang1 = JSON.parse(lang.replace(/&#34;/g, '"'));

      // console.log(lang1.smws.lang === enOuterBtn.value);

      if (lang1.smws.lang === enOuterBtn.value) {
        enBtn.style.color = 'white';
        enBtn.innerHTML += '<img src="/left_arrow.png" width="13" height="13" />';
      }

      else {
        frBtn.style.color = 'white';
        frBtn.innerHTML += '<img src="/left_arrow.png" width="13" height="13" />';
      }

      const dropdownToggle = document.querySelector("#dropdown-icon");
      const dropdownMenu = document.querySelector(".dropdown-items-list");
      let isDropdownOpen = false;

      dropdownToggle.addEventListener("click", function (e) {
        if (isDropdownOpen) {
          dropdownMenu.style.display = "none";
        } else {
          dropdownMenu.style.display = "block";
        }

        isDropdownOpen = !isDropdownOpen;
      });

      window.addEventListener("click", function (event) {
        if (!dropdownToggle.contains(event.target)) {
          dropdownMenu.style.display = "none";
        }
      });

      // document.getElementById("account-dropdown").addEventListener("click", function () {
      //   // document.getElementById("account-submenu").style.display = 'block';
      //   // console.log(document.getElementById("account-submenu"));

      //   const nestedDropdown = document.getElementById("account-submenu")
      //   if (nestedDropdown) {
      //     if (nestedDropdown.style.display === "block") {
      //       nestedDropdown.style.display = "none";
      //     } else {
      //       nestedDropdown.style.display = "block";
      //     }
      //   }
      // });

      // Function to show/hide nested dropdown based on the target ID
      function toggleNestedDropdown(targetId) {
        const nestedDropdown = document.getElementById(targetId);
        if (nestedDropdown) {
          if (nestedDropdown.style.display === "block") {
            nestedDropdown.style.display = "none";
          } else {
            nestedDropdown.style.display = "block";
          }
        }
      }

      // Add event listeners to the parent elements
      document.getElementById("account-dropdown").addEventListener("click", function () {
        // document.getElementById("services-submenu").style.display = 'block';
        toggleNestedDropdown("account-submenu");
      });

      document.getElementById("account-dropdown").addEventListener("click", function () {
        // document.getElementById("account-submenu").style.display = 'block';
        toggleNestedDropdown("services-submenu");
      });

      const searchForm = globalThis.document.getElementById('searchForm');
      const searchAll = globalThis.document.getElementById('searchAll');
      const category = globalThis.document.getElementById('category');


      searchForm.addEventListener('submit', function(e) {
        // console.log(searchAll.value);

        const selectedCategoryText = category.options[category.selectedIndex].value;

        if (searchAll.value.trim() === '') {
          e.preventDefault(); // Prevent the default form submission if it's empty
        } 
        else {
          const catText = searchAll.value.trim();
          // console.log(selectedCategoryText, catText);
    
          this.action = `/v1/product_categories/?category=${selectedCategoryText}&name=${catText}&page=`;
        }
      });
    })

    globalThis.document.addEventListener("scroll", () => {
      if (window.scrollY > 300) {
        scrollToTopBtn.style.display = "block";
      } else {
          scrollToTopBtn.style.display = "none";
      }
    })

    // JavaScript to hide the loading spinner after page load
    window.addEventListener('load', function () {
      // console.log("hii...");
      // Get the loading spinner element
      const loadingSpinner = document.getElementById('loadingSpinner');
        
      // Hide the loading spinner
      loadingSpinner.style.display = 'none';
    });