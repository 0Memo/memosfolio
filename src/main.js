import './style.scss';
import { gsap } from "gsap";
import { Howl } from "howler";

// Dynamically import - heavy libraries

const loadThree = async () => {
  const THREE = await import('three');
  const { OrbitControls } = await import('./utils/OrbitControls.js');
  const { DRACOLoader } = await import('three/examples/jsm/loaders/DRACOLoader.js');
  const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');

  // Background Music settings

  const BACKGROUND_MUSIC_VOLUME = 0.01;

  const backgroundMusic = new Howl({
    src: ["/audio/music/mambo.wav"],
    loop: true,
    volume: BACKGROUND_MUSIC_VOLUME,
  });

  // Button
  const buttonSounds = {
    click: new Howl({
      src: ["/audio/sfx/click/bubble.ogg"],
      preload: true,
      volume: 0.5,
    }),
  };

  // Scene settings

  const canvas = document.querySelector('#experience-canvas');
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
  }

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("rgb(5, 1, 12)");

  const camera = new THREE.PerspectiveCamera(
    80,
    sizes.width / sizes.height,
    0.01,
    5000
  );
  camera.position.set( 51.94528807433705, 54.06258408456772, 100.72176363464604 );

  // Render settings

  const renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );
  renderer.setSize( sizes.width, sizes.height );
  renderer.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) );

  const controls = new OrbitControls( camera, renderer.domElement );
  controls.minPolarAngle = 0;
  controls.maxPolarAngle = Math.PI / 2;
  controls.minAzimuthAngle = 0;
  controls.maxAzimuthAngle = Math.PI / 4;

  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 15;
  controls.maxDistance = 140;
  controls.enablePan = true;
  controls.update();

  controls.target.set( -11.049151171881633, 36.54974980760134, -18.965333663440102);

  const light = new THREE.DirectionalLight(0xffffff, 3);
  light.position.set(0, 10, 10);
  light.castShadow = true;
  scene.add(light);

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
  scene.add(ambientLight);

  // Event Listeners
  window.addEventListener( "resize", () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize( sizes.width, sizes.height );
    renderer.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) );
  });

  // Modal settings

  const modals = {
    work: document.querySelector(".modal.work"),
    about: document.querySelector(".modal.about"),
    contact: document.querySelector(".modal.contact"),
    education: document.querySelector(".modal.education"),
    projects: document.querySelector(".modal.projects"),
  };

  const overlay = document.querySelector(".overlay");

  let touchHappened = false;
  overlay.addEventListener(
    "touchend",
    (e) => {
      touchHappened = true;
      e.preventDefault();
      const modal = document.querySelector('.modal[style*="display: block"]');
      if (modal) hideModal(modal);
    },
    { passive: false }
  );

  overlay.addEventListener(
    "click",
    (e) => {
      if (touchHappened) return;
      e.preventDefault();
      const modal = document.querySelector('.modal[style*="display: block"]');
      if (modal) hideModal(modal);
    },
    { passive: false }
  );

  document.querySelectorAll(".modal-exit-button").forEach((button) => {
    function handleModalExit(e) {
      e.preventDefault();
      const modal = e.target.closest(".modal");

      gsap.to(button, {
        scale: 5,
        duration: 0.5,
        ease: "back.out(2)",
        onStart: () => {
          gsap.to(button, {
            scale: 1,
            duration: 0.5,
            ease: "back.out(2)",
            onComplete: () => {
              gsap.set(button, {
                clearProps: "all",
              });
            },
          });
        },
      });

      buttonSounds.click.play();
      hideModal(modal);
    }

    button.addEventListener(
      "touchend",
      (e) => {
        touchHappened = true;
        handleModalExit(e);
      },
      { passive: false }
    );

    button.addEventListener(
      "click",
      (e) => {
        if (touchHappened) return;
        handleModalExit(e);
      },
      { passive: false }
    );
  });

  let isModalOpen = true;

  const showModal = (modal) => {
    modal.style.display = "block";
    overlay.style.display = "block";

    isModalOpen = true;
    controls.enabled = false;

    if (currentHoveredObject) {
      playHoverAnimation(currentHoveredObject, false);
      currentHoveredObject = null;
    }
    document.body.style.cursor = "default";
    currentIntersects = [];

    gsap.set(modal, {
      opacity: 0,
      scale: 0,
    });
    gsap.set(overlay, {
      opacity: 0,
    });

    gsap.to(overlay, {
      opacity: 1,
      duration: 0.5,
    });

    gsap.to(modal, {
      opacity: 1,
      scale: 1,
      duration: 0.5,
      ease: "back.out(2)",
    });
  };

  const hideModal = (modal) => {
    isModalOpen = false;
    controls.enabled = true;

    gsap.to(overlay, {
      opacity: 0,
      duration: 0.5,
    });

    gsap.to(modal, {
      opacity: 0,
      scale: 0,
      duration: 0.5,
      ease: "back.in(2)",
      onComplete: () => {
        modal.style.display = "none";
        overlay.style.display = "none";
      },
    });
  };

  // Loading screen

  const manager = new THREE.LoadingManager();
  const loadingScreen = document.querySelector(".loading-screen");
  const loadingScreenButton = document.querySelector(".loading-screen-button");

  manager.onStart = function () {
    console.log("Starting loading process...");
    loadingScreenButton.style.opacity = "1";
    loadingScreenButton.innerText = "Room is loading...";
  };

  manager.onProgress = function (url, itemsLoaded, itemsTotal) {
    let progress = Math.round((itemsLoaded / itemsTotal) * 100);
    loadingScreenButton.textContent = `Room is loading...${progress}%`;
  };

  manager.onLoad = function () {
    console.log('Loading successful!');
    loadingScreenButton.textContent = `Fully loaded 100%!`;
    loadingScreenButton.style.pointerEvents = "auto"; 
    
    // Trigger opacity change using requestAnimationFrame
    requestAnimationFrame(() => {
      loadingScreenButton.style.opacity = 1;
    });

    // Use setTimeout to show the next text after a slight delay
    setTimeout(() => {
      requestAnimationFrame(() => {
        loadingScreenButton.textContent = "༄ ¡Bienvenido a mi mundo!";
      });
    }, 2000);

    let isDisabled = false;

    function handleEnter() {
      if (isDisabled) return;
      isDisabled = true;

      backgroundMusic.play();
      playReveal();
    }

    // Ensure both events work correctly
    function handleTouch(e) {
      touchHappened = true;
      e.preventDefault();
      e.stopPropagation();
      handleEnter();
    }

    function handleClick(e) {
      if (touchHappened) return;
      handleEnter();
    }

    // Attach event listeners
    loadingScreenButton.addEventListener("touchend", handleTouch, { passive: false });
    loadingScreenButton.addEventListener("click", handleClick);
  };

  function playReveal() {
    const tl = gsap.timeline();

    tl.to(loadingScreen, {
      scale: 0.5,
      duration: 0.7,
      delay: 0.1,
      ease: "back.in(1.8)",
    }).to(
      loadingScreen,
      {
        y: "200vh",
        transform: "perspective(1000px) rotateX(45deg) rotateY(-35deg)",
        duration: 1.2,
        ease: "back.in(1.8)",
        onComplete: () => {
          loadingScreen.remove();
        },
      },
      "-=0.1"
    );
  }

  // Draco Loader
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath( 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/' );
  dracoLoader.setDecoderConfig( { type: 'js' } );

  // GLTF Loader
  const loader = new GLTFLoader(manager);
  loader.setDRACOLoader(dracoLoader);

  const videoElement = document.createElement( "video" );
  videoElement.src = "/textures/video/video.mp4";
  videoElement.loop = true;
  videoElement.muted = true;
  videoElement.playsInline = true;
  videoElement.autoplay = true;
  videoElement.addEventListener('canplay', () => {
    videoElement.play();
  });

  const videoTexture = new THREE.VideoTexture( videoElement );
  videoTexture.colorSpace = THREE.SRGBColorSpace;
  videoTexture.flipY = false;

  // Raycaster settings

  const raycasterObjects = [];
  let currentIntersects = [];
  let currentHoveredObject = null;

  const socialLinks = {
    Github: "https://github.com/0Memo/",
    Linkedin: "https://www.linkedin.com/in/guillaume-mehats/",
  };

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  function handleRaycasterInteraction() {
    if (currentIntersects.length > 0) {
      const object = currentIntersects[0].object;

      if (object.name.includes("Button")) {
        buttonSounds.click.play();
      }

      Object.entries(socialLinks).forEach(([key, url]) => {
        if (object.name.includes(key)) {
          const newWindow = window.open();
          newWindow.opener = null;
          newWindow.location = url;
          newWindow.target = "_blank";
          newWindow.rel = "noopener noreferrer";
        }
      });

      if (object.name.includes("Experiences_Raycaster_Button")) {
        showModal(modals.work);
      } else if (object.name.includes("About-Me_Raycaster_Button")) {
        showModal(modals.about);
      } else if (object.name.includes("Contact_Raycaster_Button")) {
        showModal(modals.contact);
      } else if (object.name.includes("Education_Raycaster_Button")) {
        showModal(modals.education);
      } else if (object.name.includes("Projects_Raycaster_Button")) {
        showModal(modals.projects);
      }
    }
  }

  window.addEventListener("mousemove", (e) => {
    pointer.x = (e.clientX / sizes.width) * 2 - 1;
    pointer.y = -(e.clientY / sizes.height) * 2 + 1;
  });

  window.addEventListener("touchstart", (e) => {
    e.preventDefault();
    pointer.x = (e.touches[0].clientX / sizes.width) * 2 - 1;
    pointer.y = -(e.touches[0].clientY / sizes.height) * 2 + 1;
  }, { passive: false });

  window.addEventListener("touchend", (e) => {
    e.preventDefault();
    handleRaycasterInteraction();
  }, { passive: false });

  window.addEventListener("click", handleRaycasterInteraction);

  const modelUrl = "/models/Room_Project.glb";
  let lastLoggedPercentage = -1;

  let model = null;
  const loadModel = () => {
    if (model) return;

    loader.load( modelUrl, (glb) => {
      const model = glb.scene;

      model.scale.set(5, 5, 5);
      model.position.set(0, -1, 0);
      model.rotation.y = -Math.PI / 5;

      model.traverse((child) => {
        if (child.isMesh) {
          child.material.transparent = false;
          child.visible = true;

          if ( child.name.includes("Raycaster" )) {
            raycasterObjects.push(child);
          }

          if ( child.name.includes("Hover" )) {
            child.userData.initialScale = new THREE.Vector3().copy(child.scale);
            child.userData.initialPosition = new THREE.Vector3().copy(
              child.position
            );
            child.userData.initialRotation = new THREE.Euler().copy(child.rotation);
          }
    
          if ( child.name === "Screen") {
            child.material = new THREE.MeshBasicMaterial({
              map: videoTexture,
            })
          }
        }      
      });
      
      scene.background = new THREE.Color('#0b021a');
      scene.add( model);
    },
    (xhr) => {
      let percentage = Math.floor((xhr.loaded / xhr.total) * 100);

      if (percentage !== lastLoggedPercentage) {
          console.log(percentage + '% loaded');
          lastLoggedPercentage = percentage;
      }
    },
    (error) => {
      console.error("Error loading model", error);
    });
  }

  // Use IntersectionObserver to trigger model loading when it's in view
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadModel(); // Load model when it's in view
          observer.disconnect(); // Stop observing once the model is loaded
        }
      });
    },
    {
      root: null,
      rootMargin: '0px',
      threshold: 0.1 // Trigger when 10% of the model is in view
    }
  );

  // Target the element that will trigger the model loading
  const modelTrigger = document.querySelector('#model-trigger'); // Add an element that triggers the load
  observer.observe(modelTrigger);

  function playHoverAnimation(object, isHovering) {
    let scale = 1.2;
    gsap.killTweensOf(object.scale);

    if (isHovering) {
      gsap.to(object.scale, {
        x: object.userData.initialScale.x * scale,
        y: object.userData.initialScale.y * scale,
        z: object.userData.initialScale.z * scale,
        duration: 0.5,
        ease: "bounce.out(1.8)"
      });
    } else {
      gsap.to(object.scale, {
        x: object.userData.initialScale.x,
        y: object.userData.initialScale.y,
        z: object.userData.initialScale.z,
        duration: 0.3,
        ease: "bounce.out(1.8)"
      });
    }
  }

  // Other Event Listeners
  
  const muteToggleButton = document.querySelector(".mute-toggle-button");
  const soundOnSvg = document.querySelector(".sound-on-svg");
  
  const updateMuteState = (muted) => {
    if (muted) {
      backgroundMusic.volume(0);
    } else {
      backgroundMusic.volume(BACKGROUND_MUSIC_VOLUME);
    }
    
    buttonSounds.click.mute(muted);
  };
  
  let isMuted = false;

  // Initialize mute state
  const initializeMuteState = () => {
    // Check the initial volume to determine if the sound is muted or not
    isMuted = backgroundMusic.volume() === 0;
    updateMuteState(isMuted);

    // Set the initial class on the button based on mute state
    if (isMuted) {
      muteToggleButton.classList.add("sound-off");
      muteToggleButton.classList.remove("sound-on");
    } else {
      muteToggleButton.classList.add("sound-on");
      muteToggleButton.classList.remove("sound-off");
    }
  };

  // Run the initialization when the page loads
  initializeMuteState();

  const handleMuteToggle = (e) => {
    e.preventDefault();

    // Toggle mute state
    isMuted = !isMuted;

    // Update mute state immediately
    updateMuteState(isMuted);
  
    if ('requestIdleCallback' in window) {
      // Play the sound effect for the toggle
      buttonSounds.click.play();

      // Toggle the border color class based on mute state
      muteToggleButton.classList.toggle("sound-on", !isMuted);
      muteToggleButton.classList.toggle("sound-off", isMuted);
      
      gsap.to(muteToggleButton, {
        scale: 1.2,
        duration: 0.2,
        ease: "back.out(2)",
        onStart: () => {
          soundOnSvg.style.display = "block";
        },
        onComplete: () => {
          gsap.to(muteToggleButton, {
            scale: 1,
            duration: 0.2,
            ease: "back.out(2)",
            onComplete: () => gsap.set(muteToggleButton, { clearProps: "all" }),
          });
        },
      });
    } else {
      setTimeout(() => {
        // Fallback if requestIdleCallback isn't supported
        buttonSounds.click.play();

        // Toggle the border color class based on mute state
        muteToggleButton.classList.toggle("sound-on", !isMuted);
        muteToggleButton.classList.toggle("sound-off", isMuted);

        gsap.to(muteToggleButton, {
          scale: 1.2,
          duration: 0.2,
          ease: "back.out(2)",
          onStart: () => {
            soundOnSvg.style.transform = 'scale(1)';
          },
          onComplete: () => {
            gsap.to(muteToggleButton, {
              scale: 1,
              duration: 0.2,
              ease: "back.out(2)",
              onComplete: () => gsap.set(muteToggleButton, { clearProps: "all" }),
            });
          },
        });
      }, 0);
    }
  };
  
  muteToggleButton.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (touchHappened) return;  // This is optional, for handling double-tap or touch events.
  
    handleMuteToggle(e);
  });

  const render = () => {
    controls.update();

  /*   console.log('camera.position', camera.position);
    console.log('00000000');
    console.log('controls.target', controls.target); */

    // Raycaster
        raycaster.setFromCamera( pointer, camera );

        currentIntersects = raycaster.intersectObjects(raycasterObjects);

        for ( let i = 0; i < currentIntersects.length; i++ ) {}

        if ( currentIntersects.length > 0 ) {
          const currentIntersectObject = currentIntersects[0].object;

          if (currentIntersectObject.name.includes("Hover")) {
            if (currentIntersectObject !== currentHoveredObject) {
              if (currentHoveredObject) {
                playHoverAnimation(currentHoveredObject, false);
              }
              playHoverAnimation(currentIntersectObject, true);
              currentHoveredObject = currentIntersectObject;
            }
          }

          if ( currentIntersectObject.name.includes("Pointer")) {
            document.body.style.cursor = "pointer";
          } else {
            document.body.style.cursor = "default";
          }
        } else {
          if (currentHoveredObject) {
            playHoverAnimation(currentHoveredObject, false);
            currentHoveredObject = null;
          }
          document.body.style.cursor = "default";
        }

    renderer.render( scene, camera );

    window.requestAnimationFrame( render );
  }

  render();
};

loadThree();