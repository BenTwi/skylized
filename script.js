
console.log("SKYLIZED")

window.addEventListener("load", () => {
    console.log("[SKYLIZED] Initializing...");
    setTimeout(() => SKYLIZE.init(), 100);
  });
  
  class SKYLIZED extends EventTarget {
    constructor() {
      super();
  
      // Utilities
      this.utils = {
        wait: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  
        animations: {
          slideFade: async (element, config = {}) => {
            const {
              speed = 300,
              direction = "left",
              timeout = 50,
              newContent = null,
            } = config;
  
            const distance = "100%";
            element.style.transition = `opacity ${speed}ms, transform ${speed}ms`;
            element.style.opacity = 0;
  
            // Slide out
            const directions = {
              left: `translateX(-${distance})`,
              right: `translateX(${distance})`,
              top: `translateY(-${distance})`,
              bottom: `translateY(${distance})`,
            };
            element.style.transform = directions[direction] || "translateX(0)";
  
            await this.utils.wait(speed + timeout);
  
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
  
            // Slide in
            element.style.transform = "translate(0, 0)";
            element.style.opacity = 1;
  
            await this.utils.wait(speed);
          },
  
          flicker: async (elements, inOut = "out") => {
            if (!Array.isArray(elements)) elements = [elements];
  
            const flickerElement = async (el) => {
              const flickTimes = 3;
  
              for (let i = 0; i < flickTimes; i++) {
                el.style.opacity =
                  i % 2 === 0
                    ? inOut === "out"
                      ? "0"
                      : "1"
                    : inOut === "out"
                    ? "1"
                    : "0";
  
                const delay = Math.floor(Math.random() * (80 - 20 + 1)) + 20;
                await this.utils.wait(delay);
              }
  
              el.style.opacity = inOut === "out" ? "0" : "1";
            };
  
            await Promise.all(elements.map(flickerElement));
          },
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
  
        getRelativeTime: (timestamp) => {
          const date = new Date(timestamp);
          const now = new Date();
  
          const diffInSeconds = Math.floor((now - date) / 1000);
          const diffInMinutes = Math.floor(diffInSeconds / 60);
          const diffInHours = Math.floor(diffInMinutes / 60);
          const diffInDays = Math.floor(diffInHours / 24);
          const diffInWeeks = Math.floor(diffInDays / 7);
  
          if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
          if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
          if (diffInHours < 24) return `${diffInHours}h ago`;
          if (diffInDays === 1) return `yesterday`;
          if (diffInDays < 7) return `${diffInDays}d ago`;
          if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
  
          return date.toLocaleDateString();
        }
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
  
        timings: ({ timezone, country, format = "24" }) => {
          const dateElements = document.querySelectorAll(".digitalClock_date");
          const timeElements = document.querySelectorAll(".digitalClock_time");
  
          dateElements.forEach((el) => {
            el.textContent = new Date().toLocaleDateString(country, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              timeZone: timezone,
            });
          });
  
          timeElements.forEach((el) => {
            const time = new Date().toLocaleTimeString(country, {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              timeZone: timezone,
              hourCycle: format === "24" ? "h23" : "h12",
            });
  
            el.style.fontFamily = "'Open Sans', sans-serif";
            el.textContent = `${time}${format === "24" ? " UHR" : ""}`;
          });
        },
      };
    }
  
    init() {
      console.log("[SKYLIZED] Init Repetitive...");
  
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
      this._repetitiveTasks.applySelectables();
    }
  }
  
  // Instantiate the class
  const SKYLIZE = new SKYLIZED();
  