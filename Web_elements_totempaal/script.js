// Modal Functions
async function handleSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      document.getElementById("successModal").style.display = "flex";
      form.reset();
    } else {
      alert("Er ging iets mis. Probeer het later opnieuw.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Er ging iets mis. Probeer het later opnieuw.");
  }
}

function closeModal() {
  document.getElementById("successModal").style.display = "none";
}

document.addEventListener("DOMContentLoaded", function () {
  const textPairs = Array.from(
    document.querySelectorAll(".cube-text-pair")
  ).reverse();
  let currentIndex = 0;
  const scrollDuration = 35000;
  const transitionDuration = 2000;

  // Add page visibility handling
  let pageVisible = true;
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      pageVisible = false;
      textPairs.forEach((pair) => {
        const textSection = pair.querySelector(".text-section");
        const state = pairStates.get(pair);
        if (state) {
          state.isPaused = true;
          textSection.classList.add("paused");
        }
      });
    } else {
      pageVisible = true;
      textPairs.forEach((pair) => {
        const textSection = pair.querySelector(".text-section");
        const state = pairStates.get(pair);
        if (state && !state.isTextPaused) {
          state.isPaused = false;
          textSection.classList.remove("paused");
        }
      });
    }
  });

  // Track states for cube-text pairs
  const pairStates = new Map();

  function initializePairState(pair) {
    if (!pairStates.has(pair)) {
      pairStates.set(pair, {
        rotation: 0,
        isPaused: false,
        isTextPaused: false,
        animationId: null,
      });
    }
    return pairStates.get(pair);
  }

  function rotateCube(pair) {
    const cube = pair.querySelector(".image-cube");
    const state = initializePairState(pair);

    function animate() {
      if (!state.isPaused && pageVisible) {
        if (pair.classList.contains("active")) {
          state.rotation += 0.2;
        } else {
          state.rotation += 0.02;
        }
        cube.style.transform = `rotateY(${state.rotation}deg)`;
      }
      state.animationId = requestAnimationFrame(animate);
    }
    animate();
  }

  function pauseText(pair) {
    const state = pairStates.get(pair);
    const textSection = pair.querySelector(".text-section");
    if (state && textSection.classList.contains("scrolling")) {
      state.isTextPaused = true;
      textSection.classList.add("paused");
    }
  }

  function resumeText(pair) {
    const state = pairStates.get(pair);
    const textSection = pair.querySelector(".text-section");
    if (state && pageVisible) {
      state.isTextPaused = false;
      textSection.classList.remove("paused");
    }
  }

  function pauseCube(cube) {
    const pair = cube.closest(".cube-text-pair");
    const state = pairStates.get(pair);
    if (state) {
      state.isPaused = true;
      cube.style.transform = `rotateY(${state.rotation}deg)`;
    }
  }

  function resumeCube(cube) {
    const pair = cube.closest(".cube-text-pair");
    const state = pairStates.get(pair);
    if (state && pageVisible) {
      state.isPaused = false;
      cube.style.transform = `rotateY(${state.rotation}deg)`;
    }
  }

  function showNextPair() {
    if (!pageVisible) {
      setTimeout(showNextPair, 1000);
      return;
    }

    const currentPair = textPairs[currentIndex];
    const nextIndex = (currentIndex + 1) % textPairs.length;

    // Reset all pairs more thoroughly
    textPairs.forEach((pair) => {
      const textSection = pair.querySelector(".text-section");
      const cube = pair.querySelector(".image-cube");
      pair.classList.remove("active");
      textSection.classList.remove("scrolling");
      textSection.classList.remove("paused");
      textSection.style.opacity = "0";
      textSection.style.visibility = "hidden";
      textSection.querySelector(".text-content").style.transform =
        "translateY(0)";
      cube.style.left = "0px";
    });

    const currentText = currentPair.querySelector(".text-section");
    const currentCube = currentPair.querySelector(".image-cube");

    requestAnimationFrame(() => {
      if (pageVisible) {
        currentText.style.visibility = "visible";
        currentText.style.opacity = "1";
        currentPair.classList.add("active");
        currentCube.style.transition = "left 1.5s ease-out";
        currentCube.style.left = "-130px";

        setTimeout(() => {
          if (!pairStates.get(currentPair)?.isTextPaused && pageVisible) {
            currentText.classList.add("scrolling");
          }
        }, 1500);
      }
    });

    setTimeout(() => {
      if (pageVisible) {
        currentPair.classList.remove("active");
        currentCube.style.transition = "left 1.5s ease-in";
        currentCube.style.left = "0px";

        setTimeout(() => {
          currentText.classList.remove("scrolling");
          currentText.classList.remove("paused");
          currentText.style.opacity = "0";
          currentIndex = nextIndex;
          showNextPair();
        }, transitionDuration);
      }
    }, scrollDuration - transitionDuration);
  }

  // Rest of your existing code stays the same from here...
  // Add event listeners to each pair
  textPairs.forEach((pair) => {
    const cube = pair.querySelector(".image-cube");
    const textSection = pair.querySelector(".text-section");

    rotateCube(pair);

    cube.addEventListener("mouseenter", () => {
      pauseCube(cube);
    });

    cube.addEventListener("mouseleave", () => {
      resumeCube(cube);
    });

    textSection.addEventListener("mouseenter", () => {
      pauseText(pair);
    });

    textSection.addEventListener("mouseleave", () => {
      resumeText(pair);
    });

    cube.addEventListener("touchstart", (e) => {
      e.preventDefault();
      pauseCube(cube);
    });

    cube.addEventListener("touchend", (e) => {
      e.preventDefault();
      resumeCube(cube);
    });

    textSection.addEventListener("touchstart", (e) => {
      e.preventDefault();
      pauseText(pair);
    });

    textSection.addEventListener("touchend", (e) => {
      e.preventDefault();
      resumeText(pair);
    });
  });

  if (textPairs.length > 0) {
    setTimeout(showNextPair, 1000);
  }

  const hamburgerIcon = document.querySelector(".hamburger-icon");
  const menuItems = document.querySelector(".menu-items");
  const menuDropdowns = document.querySelectorAll(".menu-dropdown");

  if (hamburgerIcon && menuItems) {
    let menuOpen = false;

    hamburgerIcon.addEventListener("click", function (e) {
      e.stopPropagation();
      menuOpen = !menuOpen;
      this.classList.toggle("active");
      menuItems.classList.toggle("active");
    });

    menuDropdowns.forEach((dropdown) => {
      const link = dropdown.querySelector(".menu-link");
      link.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        menuDropdowns.forEach((otherDropdown) => {
          if (otherDropdown !== dropdown) {
            otherDropdown.classList.remove("active");
          }
        });
        dropdown.classList.toggle("active");
      });
    });

    document.addEventListener("click", function (e) {
      if (
        menuOpen &&
        !menuItems.contains(e.target) &&
        !hamburgerIcon.contains(e.target)
      ) {
        menuOpen = false;
        hamburgerIcon.classList.remove("active");
        menuItems.classList.remove("active");
        menuDropdowns.forEach((dropdown) => {
          dropdown.classList.remove("active");
        });
      }
    });

    menuItems.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  }

  const footerLink = document.querySelector(".footer-link");
  footerLink.addEventListener("click", function (e) {
    e.preventDefault();
    const mailtoLink = `mailto:mkimmijzer@outlook.com?subject=meer informatie met betrekking tot websites of webapps`;
    const hiddenLink = document.createElement("a");
    hiddenLink.href = mailtoLink;
    hiddenLink.style.display = "none";
    document.body.appendChild(hiddenLink);
    hiddenLink.click();
    document.body.removeChild(hiddenLink);
  });

  window.onclick = function (event) {
    const modal = document.getElementById("successModal");
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
});
