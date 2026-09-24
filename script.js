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
const loveActions = collection(db, "love_actions");


// ============================================================
// PEOPLE
// ============================================================

const PEOPLE = {
    AIDAN: "Aidan",
    SAM: "Sammy"
};

let currentUser = localStorage.getItem("loveMachineUser");


// ============================================================
// ELEMENTS
// ============================================================

const identityOverlay = document.getElementById("identityOverlay");
const app = document.getElementById("app");

const hugButton = document.getElementById("hugButton");
const kissButton = document.getElementById("kissButton");

const hugCountElement = document.getElementById("hugCount");
const kissCountElement = document.getElementById("kissCount");

const recentLove = document.getElementById("recentLove");
const message = document.getElementById("message");


// ============================================================
// CHOOSE IDENTITY
// ============================================================

function chooseIdentity(person) {

    currentUser = person;

    localStorage.setItem(
        "loveMachineUser",
        currentUser
    );

    identityOverlay.classList.add("hidden");
    app.classList.remove("hidden");

}


// ============================================================
// IDENTITY BUTTONS
// ============================================================

document
    .getElementById("aidanButton")
    ?.addEventListener(
        "click",
        () => chooseIdentity(PEOPLE.AIDAN)
    );

document
    .getElementById("samButton")
    ?.addEventListener(
        "click",
        () => chooseIdentity(PEOPLE.SAM)
    );


// ============================================================
// RESTORE IDENTITY
// ============================================================

if (currentUser === PEOPLE.AIDAN || currentUser === PEOPLE.SAM) {

    identityOverlay.classList.add("hidden");
    app.classList.remove("hidden");

}


// ============================================================
// SEND LOVE
// ============================================================

async function sendLove(type) {

    if (!currentUser) return;

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

        showMessage(
            type === "hug"
                ? "🫂 Hug sent!"
                : "💋 Kiss sent!"
        );

        createHeart(
            type === "hug"
                ? "🫂"
                : "💋"
        );

    } catch (error) {

        console.error(
            "Failed to send love:",
            error
        );

        showMessage(
            "Something went wrong 😭"
        );

    } finally {

        hugButton.disabled = false;
        kissButton.disabled = false;

    }

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
    (snapshot) => {

        const actions = [];

        snapshot.forEach(
            (doc) => {

                actions.push({
                    id: doc.id,
                    ...doc.data()
                });

            }
        );


        updateCounters(actions);

        renderRecent(actions);

    },

    (error) => {

        console.error(
            "Firestore listener error:",
            error
        );

        showMessage(
            "Couldn't load our love history 😭"
        );

    }
);


// ============================================================
// COUNTERS
// ============================================================

function updateCounters(actions) {

    const hugs = actions.filter(
        action => action.type === "hug"
    ).length;

    const kisses = actions.filter(
        action => action.type === "kiss"
    ).length;


    hugCountElement.textContent = hugs;
    kissCountElement.textContent = kisses;

}


// ============================================================
// RECENT LOVE
// ============================================================

function renderRecent(actions) {

    const recent = actions.slice(0, 10);

    if (recent.length === 0) {

        recentLove.innerHTML = `
            <div class="empty-state">
                No love sent yet. Be the first. 💙
            </div>
        `;

        return;

    }


    recentLove.innerHTML = recent.map(
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
                            ${escapeHTML(action.sender)}
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
// TIME FORMAT
// ============================================================

function formatTimestamp(timestamp) {

    if (!timestamp) {
        return "Just now";
    }


    const date = timestamp.toDate();

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

function showMessage(text) {

    message.textContent = text;

    message.classList.add("show");


    setTimeout(
        () => {
            message.classList.remove("show");
        },
        2500
    );

}


// ============================================================
// FLOATING HEARTS
// ============================================================

function createHeart(symbol) {

    const heart = document.createElement("div");

    heart.className = "floating-heart";

    heart.textContent = symbol;

    heart.style.left =
        `${Math.random() * 90 + 5}%`;

    document.body.appendChild(heart);


    setTimeout(
        () => heart.remove(),
        2500
    );

}


// ============================================================
// HTML ESCAPING
// ============================================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent = value;

    return div.innerHTML;

}
