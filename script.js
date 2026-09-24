/* ============================================================
   OUR LITTLE LOVE MACHINE
   FIREBASE EDITION
   ============================================================ */


/* ============================================================
   FIREBASE
   ============================================================ */

import {
    collection,
    addDoc,
    query,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp
} from
"https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


const db =
    window.loveMachineDB;


const loveActions =
    collection(
        db,
        "love_actions"
    );


/* ============================================================
   PEOPLE
   ============================================================ */

const PEOPLE = {

    AIDAN:
        "Aidan",

    SAM:
        "Sammy"

};


/* ============================================================
   ELEMENTS
   ============================================================ */

const identityOverlay =
    document.getElementById(
        "identityOverlay"
    );


const identityButtons =
    document.querySelectorAll(
        ".identity-button"
    );


const currentUserElement =
    document.getElementById(
        "currentUser"
    );


const hugButton =
    document.getElementById(
        "hugButton"
    );


const kissButton =
    document.getElementById(
        "kissButton"
    );


const hugCountElement =
    document.getElementById(
        "hugCount"
    );


const kissCountElement =
    document.getElementById(
        "kissCount"
    );


const messageBox =
    document.getElementById(
        "messageBox"
    );


const messageIcon =
    document.getElementById(
        "messageIcon"
    );


const messageTitle =
    document.getElementById(
        "messageTitle"
    );


const messageText =
    document.getElementById(
        "messageText"
    );


const recentActions =
    document.getElementById(
        "recentActions"
    );


const floatingHearts =
    document.getElementById(
        "floatingHearts"
    );


/* ============================================================
   STATE
   ============================================================ */

let currentUser =
    localStorage.getItem(
        "loveMachineUser"
    );


let actions = [];


/* ============================================================
   IDENTITY
   ============================================================ */

if (currentUser) {

    initializeUser();

} else {

    identityOverlay.classList.remove(
        "hidden"
    );

}


identityButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            currentUser =
                button.dataset.person;


            localStorage.setItem(
                "loveMachineUser",
                currentUser
            );


            initializeUser();

        }
    );

});


/* ============================================================
   INITIALIZE
   ============================================================ */

function initializeUser() {

    currentUserElement.textContent =
        currentUser;


    identityOverlay.classList.add(
        "hidden"
    );


    startRealtimeListener();

}


/* ============================================================
   REALTIME DATABASE LISTENER
   ============================================================ */

function startRealtimeListener() {

    const recentQuery =
        query(
            loveActions,

            orderBy(
                "createdAt",
                "desc"
            ),

            limit(100)
        );


    onSnapshot(
        recentQuery,
        snapshot => {

            actions =
                snapshot.docs.map(
                    document => ({

                        id:
                            document.id,

                        ...document.data()

                    })
                );


            updateCounters();

            renderRecent();

        },

        error => {

            console.error(
                "Firebase error:",
                error
            );


            showMessage(
                "⚠️",
                "Something went wrong",
                "I couldn't connect to our love machine."
            );

        }
    );

}


/* ============================================================
   HUG
   ============================================================ */

hugButton.addEventListener(
    "click",
    () => {

        sendLove("hug");

    }
);


/* ============================================================
   KISS
   ============================================================ */

kissButton.addEventListener(
    "click",
    () => {

        sendLove("kiss");

    }
);


/* ============================================================
   SEND LOVE
   ============================================================ */

async function sendLove(type) {

    if (!currentUser) {

        return;

    }


    const button =
        type === "hug"
            ? hugButton
            : kissButton;


    button.disabled = true;


    try {

        await addDoc(
            loveActions,
            {

                type:
                    type,

                sender:
                    currentUser,

                createdAt:
                    serverTimestamp()

            }
        );


        /*
         * Firebase Realtime listeners will update
         * the counters and recent activity.
         */


        if (type === "hug") {

            showMessage(
                "🫂",
                "Hug sent!",
                `A hug from ${currentUser}, delivered across the distance.`
            );

        } else {

            showMessage(
                "💋",
                "Kiss sent!",
                `A little kiss from ${currentUser}, delivered just for you.`
            );

        }


        createFloatingHearts();

    } catch (error) {

        console.error(
            "Could not send love:",
            error
        );


        showMessage(
            "⚠️",
            "It didn't send",
            "Something went wrong. Try again?"
        );

    }


    button.disabled = false;

}


/* ============================================================
   COUNTERS
   ============================================================ */

function updateCounters() {

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


    messageBox.classList.remove(
        "pop"
    );


    void messageBox.offsetWidth;


    messageBox.classList.add(
        "pop"
    );

}


/* ============================================================
   RECENT LOVE
   ============================================================ */

function renderRecent() {

    if (actions.length === 0) {

        recentActions.innerHTML = `

            <div class="empty-state">

                <span>
                    💙
                </span>

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
        actions
            .slice(0, 10)
            .map(
                action => {

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
                                    ${escapeHTML(
                                        action.sender
                                    )}
                                </strong>

                                ${label}

                            </span>


                            <span>

                                ${formatTimestamp(
                                    action.createdAt
                                )}

                            </span>

                        </div>

                    `;

                }
            )
            .join("");

}


/* ============================================================
   TIMESTAMP
   ============================================================ */

function formatTimestamp(
    timestamp
) {

    if (!timestamp) {

        return "Just now";

    }


    const date =
        timestamp.toDate();


    const now =
        new Date();


    const sameDay =
        date.toDateString() ===
        now.toDateString();


    if (sameDay) {

        return date.toLocaleTimeString(
            [],
            {

                hour:
                    "numeric",

                minute:
                    "2-digit"

            }
        );

    }


    return date.toLocaleDateString(
        [],
        {

            month:
                "short",

            day:
                "numeric"

        }
    );

}


/* ============================================================
   FLOATING HEARTS
   ============================================================ */

function createFloatingHearts() {

    const amount =
        12;


    for (
        let i = 0;
        i < amount;
        i++
    ) {

        setTimeout(
            () => {

                const heart =
                    document.createElement(
                        "div"
                    );


                heart.className =
                    "floating-heart";


                heart.textContent =
                    "💙";


                heart.style.left =
                    `${Math.random() * 100}%`;


                heart.style.animationDelay =
                    `${Math.random() * 0.5}s`;


                heart.style.fontSize =
                    `${16 + Math.random() * 18}px`;


                floatingHearts.appendChild(
                    heart
                );


                setTimeout(
                    () => {

                        heart.remove();

                    },
                    4000
                );

            },
            i * 80
        );

    }

}


/* ============================================================
   HTML ESCAPING
   ============================================================ */

function escapeHTML(value) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}
