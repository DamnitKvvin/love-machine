/* ============================================================
   OUR LITTLE LOVE MACHINE
   ============================================================ */


/* ============================================================
   ELEMENTS
   ============================================================ */

const hugButton = document.getElementById("hugButton");
const kissButton = document.getElementById("kissButton");

const hugCountElement = document.getElementById("hugCount");
const kissCountElement = document.getElementById("kissCount");

const messageBox = document.getElementById("messageBox");
const messageIcon = document.getElementById("messageIcon");
const messageTitle = document.getElementById("messageTitle");
const messageText = document.getElementById("messageText");

const recentActions = document.getElementById("recentActions");


/* ============================================================
   LOAD SAVED DATA
   ============================================================ */

let hugCount = Number(
    localStorage.getItem("hugCount") || 0
);

let kissCount = Number(
    localStorage.getItem("kissCount") || 0
);

let actions = JSON.parse(
    localStorage.getItem("loveActions") || "[]"
);


/* ============================================================
   INITIALIZE
   ============================================================ */

updateCounters();
renderRecent();


/* ============================================================
   BUTTON EVENTS
   ============================================================ */

hugButton.addEventListener("click", () => {

    hugCount++;

    localStorage.setItem(
        "hugCount",
        hugCount
    );

    addAction("hug");

    showMessage(
        "🫂",
        "Hug sent!",
        "Wrapping you in the biggest virtual hug I can send."
    );

});


kissButton.addEventListener("click", () => {

    kissCount++;

    localStorage.setItem(
        "kissCount",
        kissCount
    );

    addAction("kiss");

    showMessage(
        "💋",
        "Kiss sent!",
        "One little kiss, delivered across the distance."
    );

});


/* ============================================================
   COUNTERS
   ============================================================ */

function updateCounters() {

    hugCountElement.textContent = hugCount;
    kissCountElement.textContent = kissCount;

}


/* ============================================================
   MESSAGE
   ============================================================ */

function showMessage(
    icon,
    title,
    text
) {

    messageIcon.textContent = icon;
    messageTitle.textContent = title;
    messageText.textContent = text;

    messageBox.classList.remove("pop");

    void messageBox.offsetWidth;

    messageBox.classList.add("pop");

}


/* ============================================================
   ACTION HISTORY
   ============================================================ */

function addAction(type) {

    const action = {
        type: type,
        timestamp: Date.now()
    };

    actions.unshift(action);

    // Keep the last 10 actions.
    actions = actions.slice(0, 10);

    localStorage.setItem(
        "loveActions",
        JSON.stringify(actions)
    );

    renderRecent();

}


/* ============================================================
   RENDER RECENT ACTIONS
   ============================================================ */

function renderRecent() {

    if (actions.length === 0) {

        recentActions.innerHTML = `
            <div class="empty-state">
                No hugs or kisses yet...
            </div>
        `;

        return;
    }


    recentActions.innerHTML = actions
        .map(action => {

            const icon =
                action.type === "hug"
                    ? "🫂"
                    : "💋";

            const label =
                action.type === "hug"
                    ? "Hug sent"
                    : "Kiss sent";

            return `
                <div class="recent-item">
                    <span>
                        ${icon} ${label}
                    </span>

                    <span>
                        ${formatTime(action.timestamp)}
                    </span>
                </div>
            `;

        })
        .join("");

}


/* ============================================================
   TIME FORMATTER
   ============================================================ */

function formatTime(timestamp) {

    const date = new Date(timestamp);

    return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit"
    });

}