

  window.addEventListener('load', () => {
    const SKYLIZE = new SKYLIZED();   // <== move this inside
    setTimeout(() => SKYLIZE.init(), 100);
  })

  
  class SKYLIZED extends EventTarget {
    constructor() {
      super();

      this._storage = {
        dependencies: [
          {type: "stylesheet", url: "https://www.skykopf.de/skylized/style.css", tag: "internal"},
          {type: "stylesheet", url: "https://cdn.jsdelivr.net/npm/bootstrap-icons@latest/font/bootstrap-icons.min.css", tag: "third-party"}
                ],
        runtimeFlags: {
          isFirstDateUpdate: true
        }
      }
      
      // Utilities
      this.utils = {
        wait: (ms) => {
          return new Promise((resolve) => setTimeout(resolve, ms));
        },
  
        animations: {
          slideFade: async (element, config = {}) => {
            const {
              speed = 300,
              direction = "left",
              timeout = 50,
              newContent = null,
              strength = 50,
              moveInFromOtherSide = true,
              disableFade = false,
              deleteAfterFadeOut = false,
            } = config;
  
            const distance = strength + "px";
            const originalTransitionStyle = element.style.transition;
            element.style.transition = `opacity ${speed}ms, transform ${speed}ms`;
            if(!disableFade) element.style.opacity = 0;
  
            // Slide out
            const directions = {
              left: `translateX(-${distance})`,
              right: `translateX(${distance})`,
              up: `translateY(-${distance})`,
              down: `translateY(${distance})`,
            };
            element.style.transform = directions[direction] || "translateX(0)";
  
            await this.utils.wait(speed);
  
            // Replace content if provided
            if (newContent) {
              if (newContent.color) element.style.color = newContent.color;
              if (newContent.innerHTML) element.innerHTML = newContent.innerHTML;
  
              if (
                newContent.src &&
                (element.tagName === "IMG" || element.tagName === "VIDEO")
              ) {
                element.src = newContent.src;
              }
            }

            if(deleteAfterFadeOut){
              element.remove()
              return;
            }

            await this.utils.wait(timeout)
            
            // Slide in
            if(moveInFromOtherSide){

              let invervetedDirection;
              switch(direction){
                case "up":
                  invervetedDirection = "down";
                break;
                case "down":
                  invervetedDirection = "up";
                break;
                case "left":
                  invervetedDirection = "right";
                break;
                case "right":
                  invervetedDirection = "left";
                break;
              }
              element.style.transition = "none";
              element.style.transform = directions[invervetedDirection] || "translateX(0)";
              
              setTimeout(() => {
                element.style.transition = originalTransitionStyle;
                element.style.transform = "translate(0, 0)";
                if(!disableFade) element.style.opacity = 1;
              }, 50)

            } else {
              setTimeout(() => {
                element.style.transform = "translate(0, 0)";
                if(!disableFade) element.style.opacity = 1;
              }, 50)
            }
  
            await this.utils.wait(speed);
          },
  
          flicker: async (elements, inOut = "out", flickTimes = 3, delayMin = 20, delayMax = 80) => {
            if (!Array.isArray(elements)) elements = [elements];
  
            const flickerElement = async (el) => {
  
              for (let i = 0; i < flickTimes; i++) {
                el.style.opacity =
                  i % 2 === 0
                    ? inOut === "out"
                      ? "0"
                      : "1"
                    : inOut === "out"
                    ? "1"
                    : "0";
  
                const delay = Math.floor(Math.random() * (delayMax - 20 + 1)) + delayMin;
                await this.utils.wait(delay);
              }
  
              el.style.opacity = inOut === "out" ? "0" : "1";
            };
  
            await Promise.all(elements.map(flickerElement));
          }
        },
  
        createSelectable: (data, parent) => {
          const { icon, definition, elementLocation, type } = data;
  
          const outerDiv = document.createElement("div");
          outerDiv.classList.add(
            elementLocation,
            `${elementLocation}_${definition}`,
            `${elementLocation}_${type}`,
            "selectOnClick",
            "flexDisplay",
            "flexAlignCenter",
            "flexJustifyStart",
            "flexDirectionRow",
            "gap10"
          );
  
          const iconElement = document.createElement("i");
          iconElement.classList.add("sidebarIcons", "bi", `bi-${icon}`);
  
          const definitionDiv = document.createElement("div");
          definitionDiv.classList.add("sidebarDefinitions");
          definitionDiv.innerText = definition;
  
          outerDiv.appendChild(iconElement);
          outerDiv.appendChild(definitionDiv);
          parent.appendChild(outerDiv);
        },
  
        getRelativeTime: (input) => {
  let date = (input instanceof Date) ? input : new Date(
    typeof input === "number" && input < 1e12 ? input * 1000 : input
  );

  if (isNaN(date)) return "Invalid date";

  const now = new Date();
  let diffInSeconds = Math.floor((now - date) / 1000);
  const future = diffInSeconds < 0;
  diffInSeconds = Math.abs(diffInSeconds);

  const units = [
    { name: "year",   seconds: 31536000 },
    { name: "month",  seconds: 2592000 },
    { name: "week",   seconds: 604800 },
    { name: "day",    seconds: 86400 },
    { name: "hour",   seconds: 3600 },
    { name: "minute", seconds: 60 },
    { name: "second", seconds: 1 }
  ];

  for (const unit of units) {
    const value = Math.floor(diffInSeconds / unit.seconds);
    if (value >= 1) {
      return future
        ? `in ${value} ${unit.name}${value > 1 ? "s" : ""}`
        : `${value} ${unit.name}${value > 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
},

      };
  
      // Repetitive tasks
      this._repetitiveTasks = {
        applySelectables: () => {
          const selectOnClickElements = document.querySelectorAll(".selectOnClick");
  
          selectOnClickElements.forEach((element) => {
            if (element.classList.contains("selectOnClickApplyed")) return;
  
            element.classList.add("selectOnClickApplyed");
            element.addEventListener("click", () => {
              element.classList.toggle("selected");
            });
          });
        },
  
        applyGaps: () => {
          const elements = document.querySelectorAll("[class*='gap']");
  
          elements.forEach((el) => {
            const match = el.className.match(/\bgap(\d+)\b/);
            if (match) el.style.gap = `${match[1]}px`;
          });
        },
        applyPadding: () => {
          const elements = document.querySelectorAll("[class*='padding']");
  
          elements.forEach((el) => {
            const match = el.className.match(/\bpadding(\d+)\b/);
            if (match) el.style.padding = `${match[1]}px`;
          });
        },
  
        timings: ({ timezone, country, format = "24" }) => {
          const dateElements = document.querySelectorAll(".digitalClock_date");
          const timeElements = document.querySelectorAll(".digitalClock_time");

          const DATE = new Date().toLocaleDateString(country, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              timeZone: timezone,
            });
          const TIME = new Date().toLocaleTimeString("de-DE", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              timeZone: "Europe/Berlin",
              hourCycle: "24" === "24" ? "h23" : "h12",
            })
          
          if((parseInt(TIME.split(":")[1]) == 0 && parseInt(TIME.split(":")[2]) == 0) || this._storage.runtimeFlags.isFirstDateUpdate){
            this._storage.runtimeFlags.isFirstDateUpdate = false;
        dateElements.forEach((el) => {
            el.textContent = DATE;
          });
      }
  
          timeElements.forEach((el) => {  
            el.style.fontFamily = "'Open Sans', sans-serif";
            el.textContent = `${TIME}${format === "24" ? " UHR" : ""}`;
          });
        },
      };
    }
  
    init() {
      console.log("[SKYLIZED] Init Repetitive...");

      this._storage.dependencies.forEach((dependency) => {

        let LOADER;

        console.log(`[Skylized]: Adding dependencie "${dependency.url}" with tag ${dependency.tag} as type ${dependency.type}`)

        switch(dependency.type){

            case "stylesheet":
                LOADER = document.createElement("link");
                LOADER.rel = "stylesheet";
                LOADER.href = dependency.url;
                document.head.appendChild(LOADER);
            break;
            case "script":
                LOADER = document.createElement("script");
                LOADER.src = dependency.url;
                document.head.appendChild(LOADER);
            break;

        }

      })
  
      setInterval(() => {
        this._repetitiveTasks.timings({
          timezone: "Europe/Berlin",
          country: "de-DE",
          format: "24",
        });
      }, 1000);
  
      // Run initial tasks immediately
      this._repetitiveTasks.timings({
        timezone: "Europe/Berlin",
        country: "de-DE",
        format: "24",
      });
  
      this.repeatTasks();
      setInterval(() => this.repeatTasks(), 2000);
  
      console.log("[SKYLIZED] We are ready!");
    }
  
    repeatTasks() {
      this._repetitiveTasks.applyGaps();
      this._repetitiveTasks.applyPadding();
      this._repetitiveTasks.applySelectables();
    }
  }
  
  // Instantiate the class
  const SKYLIZE = new SKYLIZED();
  


//This is just for fun to mess around with collegues. Ignore this please :]
const blyat = console.log;
const clear = console.clear, cls = console.clear;


