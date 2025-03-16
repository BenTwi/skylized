window.addEventListener("load", () => {
    console.log("[SKYLIZED] Initializing..")
  setTimeout(SKYLIZE.init, 100);
});

class SKYLIZED extends EventTarget {
  constructor() {
    super();
    // Initialize the utils object here
    this.utils = {
      animations: {
        slideFade: async (element, config = {}) => {
          const {
            speed = 300,
            direction = "left",
            timeout = 50,
            newContent = null,
          } = config;

          const distance = "100%"; // or '50px' for fixed distance

          element.style.transition = `opacity ${speed}ms, transform ${speed}ms`;
          element.style.opacity = 0;

          // Slide out
          switch (direction) {
            case "left":
              element.style.transform = `translateX(-${distance})`;
              break;
            case "right":
              element.style.transform = `translateX(${distance})`;
              break;
            case "top":
              element.style.transform = `translateY(-${distance})`;
              break;
            case "bottom":
              element.style.transform = `translateY(${distance})`;
              break;
          }

          await SKYLIZE.utils.wait(speed + timeout);

          // Update content if provided
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

          // Slide in and fade back
          element.style.transform = "translate(0, 0)";
          element.style.opacity = 1;

          // Wait for the transition to finish
          await SKYLIZE.utils.wait(speed);
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
              await SKYLIZE.utils.wait(delay);
            }
            el.style.opacity = inOut === "out" ? "0" : "1";
          };

          const promises = elements.map((el) => flickerElement(el));
          await Promise.all(promises);
        },
      },

      wait: (ms) => {
        return new Promise((resolve) => setTimeout(resolve, ms));
      },

      createSelectable: (data, parent) => {
        let { icon, definition, elementLocation, type } = data;

        // Create the outer div
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

        // Create the icon element
        const iconElement = document.createElement("i");
        iconElement.classList.add("sidebarIcons", `bi`, `bi-${icon}`);

        // Create the definition div
        const definitionDiv = document.createElement("div");
        definitionDiv.classList.add("sidebarDefinitions");
        definitionDiv.innerText = definition;

        // Append icon and definition to the outer div
        outerDiv.appendChild(iconElement);
        outerDiv.appendChild(definitionDiv);

        // Append the outer div to the parent
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

        return date.toLocaleDateString(); // Default fallback
      },
    };

    this._repetiveTasks = {
      applySelectables: () => {
        const selectOnClick = document.querySelectorAll(".selectOnClick");

        selectOnClick.forEach((Element) => {
          if (Element.classList.contains("selectOnClickApplyed")) return;
          Element.classList.add("selectOnClickApplyed");
          Element.addEventListener("click", () => {
            if (Element.classList.contains("selected")) {
              Element.classList.remove("selected");
            } else {
              Element.classList.add("selected");
            }
          });
        });
      },

      applyGaps: () => {
        document.querySelectorAll("[class*='gap']").forEach((el) => {
          const match = el.className.match(/\bgap(\d+)\b/); // Find 'gap' + number
          if (match) {
            el.style.gap = `${match[1]}px`;
          }
        });
      },

      timings: ({ timezone, country, format = "24" }) => {
        const digitalClock_dateElements =
          document.querySelectorAll(".digitalClock_date");
        const digitalClock_timeElements =
          document.querySelectorAll(".digitalClock_time");

        // Update date elements
        digitalClock_dateElements.forEach((clock) => {
          const now = new Date().toLocaleDateString(country, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            timeZone: timezone,
          });
          clock.textContent = now;
        });

        // Update time elements
        digitalClock_timeElements.forEach((clock) => {
          const now = new Date().toLocaleTimeString(country, {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZone: timezone,
            hourCycle: format === "24" ? "h23" : "h12",
          });
          clock.style.fontFamily = "'Open Sans', sans-serif";
          clock.textContent = now + (format === "24" ? " UHR" : "");
        });
      },
    };
  }

  // You can still define init and other methods normally
  init() {
    console.log("[SKYLIZED] Init-Repeatative..")
    setInterval(() => {
      SKYLIZE._repetiveTasks.timings({
        timezone: "Europe/Berlin",
        country: "de-DE",
        format: "24",
      });
    }, 1000);
    SKYLIZE._repetiveTasks.timings({
      timezone: "Europe/Berlin",
      country: "de-DE",
      format: "24",
    });
    SKYLIZE.repeatTasks();
    setInterval(SKYLIZE.repeatTasks, 2000);
    console.log("[SKYLIZED] We are ready!")
  }

  repeatTasks() {
    SKYLIZE._repetiveTasks.applyGaps();
    SKYLIZE._repetiveTasks.applySelectables();
  }
}

const SKYLIZE = new SKYLIZED();
