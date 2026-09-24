/* ============================================================
   OUR LITTLE LOVE MACHINE
   ============================================================ */


/* ============================================================
   CONFIGURATION
   ============================================================ */

const PEOPLE = {
    AIDAN: "Aidan",
    BOYFRIEND: "Sam"
};

/* ============================================================
   ELEMENTS
   ============================================================ */

const identityOverlay =
    document.getElementById("identityOverlay");

const identityButtons =
    document.querySelectorAll(".identity-button");

const currentUserElement =
    document.getElementById("currentUser");

const hugButton =
    document.getElementById("hugButton");

const kissButton =
    document.getElementById("kissButton");

const hugCountElement =
    document.getElementById("hugCount");

const kissCountElement =
    document.getElementById("kissCount");

const messageBox =
    document.getElementById("messageBox");

const messageIcon =
    document.getElementById("messageIcon");

const messageTitle =
    document.getElementById("messageTitle");

const messageText =
    document.getElementById("messageText");

const recentActions =
    document.getElementById("recentActions");


/* ============================================================
   STATE
   ============================================================ */

let currentUser =
    localStorage.getItem("loveMachineUser");

let hugCount =
    Number(
        localStorage.getItem("hugCount") || 0
    );

let kissCount =
    Number(
        localStorage.getItem("kissCount") || 0
    );

let actions =
    JSON.parse(
        localStorage.getItem("loveActions") || "[]"
    );


/* ============================================================
   IDENTITY
   ============================================================ */

if (currentUser) {

    initializeUser();

} else {

    identityOverlay.classList.remove("hidden");

}


identityButtons.forEach(button => {

    button.addEventListener("click", () => {

        currentUser =
            button.dataset.person;

        localStorage.setItem(
            "loveMachineUser",
            currentUser
        );

        initializeUser();

    });

});


function initializeUser() {

    currentUserElement.textContent =
        currentUser;

    identityOverlay.classList.add("hidden");

    updateCounters();

    renderRecent();

}


/* ============================================================
   HUG
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
        `A hug from ${currentUser}, delivered across the distance.`
    );

});


/* ============================================================
   KISS
   ============================================================ */

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
        `A little kiss from ${currentUser}, delivered just for you.`
    );

});


/* ============================================================
   COUNTERS
   ============================================================ */

function updateCounters() {

    hugCountElement.textContent =
        hugCount;

    kissCountElement.textContent =
        kissCount;

}


/* ============================================================
   MESSAGE
   ============================================================ */

function showMessage(
    icon,
    title,
    text
) {

    messageIcon.textContent =
        icon;

    messageTitle.textContent =
        title;

    messageText.textContent =
        text;

    messageBox.classList.remove("pop");

    void messageBox.offsetWidth;

    messageBox.classList.add("pop");

}


/* ============================================================
   ACTIVITY
   ============================================================ */

function addAction(type) {

    const action = {

        type: type,

        sender: currentUser,

        timestamp: Date.now()

    };


    actions.unshift(action);


    // Keep the latest 10 actions.

    actions =
        actions.slice(0, 10);


    localStorage.setItem(
        "loveActions",
        JSON.stringify(actions)
    );


    renderRecent();

}


/* ============================================================
   RECENT ACTIVITY
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


    recentActions.innerHTML =
        actions
            .map(action => {

                const icon =
                    action.type === "hug"
                        ? "🫂"
                        : "💋";

                const label =
                    action.type === "hug"
                        ? "sent a hug"
                        : "sent a kiss";


                return `
                    <div class="recent-item">

                        <span>
                            ${icon}
                            <strong>
                                ${escapeHTML(action.sender)}
                            </strong>
                            ${label}
                        </span>

                        <span>
                            ${formatDate(
                                action.timestamp
                            )}
                        </span>

                    </div>
                `;

            })
            .join("");

}


/* ============================================================
   DATE FORMAT
   ============================================================ */

function formatDate(timestamp) {

    const date =
        new Date(timestamp);


    const now =
        new Date();


    const sameDay =
        date.toDateString() ===
        now.toDateString();


    if (sameDay) {

        return date.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit"
        });

    }


    return date.toLocaleDateString([], {
        month: "short",
        day: "numeric"
    });

}


/* ============================================================
   BASIC HTML ESCAPING
   ============================================================ */

function escapeHTML(value) {

    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}
