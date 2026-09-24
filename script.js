import {
    collection,
    addDoc,
    query,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


// ============================================================
// FIREBASE
// ============================================================

const db = window.loveMachineDB;

const loveActions = collection(
    db,
    "love_actions"
);


// ============================================================
// ELEMENTS
// ============================================================

const identityOverlay =
    document.getElementById("identityOverlay");

const app =
    document.getElementById("app");

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

const floatingHearts =
    document.getElementById("floatingHearts");


// ============================================================
// CURRENT USER
// ============================================================

let currentUser =
    localStorage.getItem("loveMachineUser");


// ============================================================
// IDENTITY SELECTION
// ============================================================

function chooseIdentity(person) {

    currentUser = person;

    localStorage.setItem(
        "loveMachineUser",
        currentUser
    );

    currentUserElement.textContent =
        currentUser;

    identityOverlay.classList.add("hidden");

    app.classList.remove("hidden");

}


// ============================================================
// IDENTITY BUTTONS
// ============================================================

identityButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                const person =
                    button.dataset.person;

                chooseIdentity(person);

            }
        );

    }
);


// ============================================================
// RESTORE PREVIOUS IDENTITY
// ============================================================

if (
    currentUser === "Aidan" ||
    currentUser === "Sammy"
) {

    currentUserElement.textContent =
        currentUser === "Sammy"
            ? "Sam"
            : currentUser;

    identityOverlay.classList.add("hidden");

    app.classList.remove("hidden");

}


// ============================================================
// SEND LOVE
// ============================================================

async function sendLove(type) {

    if (!currentUser) {

        showMessage(
            "💙",
            "Wait a second!",
            "Choose who you are first."
        );

        return;

    }


    hugButton.disabled = true;
    kissButton.disabled = true;


    try {

        await addDoc(
            loveActions,
            {
                type: type,
                sender: currentUser,
                createdAt: serverTimestamp()
            }
        );


        if (type === "hug") {

            showMessage(
                "🫂",
                "Hug sent!",
                `You just sent Sam a hug. 💙`
            );

            createHeart("🫂");

        } else {

            showMessage(
                "💋",
                "Kiss sent!",
                `You just sent Sam a kiss. 💙`
            );

            createHeart("💋");

        }


    } catch (error) {

        console.error(
            "Failed to send love:",
            error
        );

        showMessage(
            "😭",
            "Oops!",
            "Something went wrong sending that."
        );

    }


    hugButton.disabled = false;
    kissButton.disabled = false;

}


// ============================================================
// BUTTON EVENTS
// ============================================================

hugButton.addEventListener(
    "click",
    () => sendLove("hug")
);

kissButton.addEventListener(
    "click",
    () => sendLove("kiss")
);


// ============================================================
// LIVE FIRESTORE LISTENER
// ============================================================

const recentQuery = query(
    loveActions,
    orderBy("createdAt", "desc"),
    limit(100)
);


onSnapshot(
    recentQuery,

    snapshot => {

        const actions = [];

        snapshot.forEach(
            doc => {

                actions.push({
                    id: doc.id,
                    ...doc.data()
                });

            }
        );


        updateCounters(actions);

        renderRecent(actions);

    },

    error => {

        console.error(
            "Firestore listener error:",
            error
        );

        showMessage(
            "😭",
            "Couldn't load our love",
            "Check the browser console for details."
        );

    }
);


// ============================================================
// COUNTERS
// ============================================================

function updateCounters(actions) {

    const hugs =
        actions.filter(
            action =>
                action.type === "hug"
        ).length;


    const kisses =
        actions.filter(
            action =>
                action.type === "kiss"
        ).length;


    hugCountElement.textContent =
        hugs;

    kissCountElement.textContent =
        kisses;

}


// ============================================================
// RECENT LOVE
// ============================================================

function renderRecent(actions) {

    const recent =
        actions.slice(0, 10);


    if (recent.length === 0) {

        recentActions.innerHTML = `

            <div class="empty-state">

                <span>💙</span>

                <p>
                    No hugs or kisses yet...
                </p>

                <small>
                    Be the first to send some love.
                </small>

            </div>

        `;

        return;

    }


    recentActions.innerHTML =
        recent.map(
            action => {

                const emoji =
                    action.type === "hug"
                        ? "🫂"
                        : "💋";


                const actionName =
                    action.type === "hug"
                        ? "sent a hug"
                        : "sent a kiss";


                const time =
                    formatTimestamp(
                        action.createdAt
                    );


                return `

                    <div class="recent-item">

                        <div class="recent-icon">
                            ${emoji}
                        </div>

                        <div class="recent-text">

                            <strong>
                                ${escapeHTML(
                                    action.sender
                                )}
                            </strong>

                            <span>
                                ${actionName}
                            </span>

                        </div>

                        <div class="recent-time">
                            ${time}
                        </div>

                    </div>

                `;

            }
        ).join("");

}


// ============================================================
// FORMAT TIME
// ============================================================

function formatTimestamp(timestamp) {

    if (!timestamp) {

        return "Just now";

    }


    const date =
        timestamp.toDate();


    return date.toLocaleString(
        [],
        {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }
    );

}


// ============================================================
// MESSAGE
// ============================================================

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

    messageBox.classList.add("show");


    setTimeout(
        () => {

            messageBox.classList.remove(
                "show"
            );

        },
        3000
    );

}


// ============================================================
// FLOATING HEARTS
// ============================================================

function createHeart(symbol) {

    const heart =
        document.createElement("div");

    heart.className =
        "floating-heart";

    heart.textContent =
        symbol;


    heart.style.left =
        `${Math.random() * 90 + 5}%`;


    floatingHearts.appendChild(
        heart
    );


    setTimeout(
        () => {

            heart.remove();

        },
        2500
    );

}


// ============================================================
// HTML ESCAPING
// ============================================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value;

    return div.innerHTML;

}
