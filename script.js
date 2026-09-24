/* ============================================================
   OUR LITTLE LOVE MACHINE
   ============================================================ */


/* ============================================================
   SUPABASE CONFIGURATION
   ============================================================ */

// Replace these with your actual Supabase project values.

const SUPABASE_URL =
    "YOUR_SUPABASE_PROJECT_URL";

const SUPABASE_KEY =
    "YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY";


const supabase =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* ============================================================
   CONFIGURATION
   ============================================================ */

const PEOPLE = {
    AIDAN: "Aidan",
    BOYFRIEND: "Sam"
};

const TABLE_NAME = "love_actions";


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

let actions = [];


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


async function initializeUser() {

    currentUserElement.textContent =
        currentUser;

    identityOverlay.classList.add("hidden");

    await loadActions();

    subscribeToActions();

}


/* ============================================================
   LOAD ACTIONS
   ============================================================ */

async function loadActions() {

    const { data, error } =
        await supabase
            .from(TABLE_NAME)
            .select("*")
            .order("created_at", {
                ascending: false
            });


    if (error) {

        console.error(
            "Could not load love actions:",
            error
        );

        showMessage(
            "⚠️",
            "Something went wrong",
            "I couldn't load our love history."
        );

        return;

    }


    actions = data || [];

    updateCounters();

    renderRecent();

}


/* ============================================================
   HUG
   ============================================================ */

hugButton.addEventListener("click", async () => {

    await sendLove("hug");

});


/* ============================================================
   KISS
   ============================================================ */

kissButton.addEventListener("click", async () => {

    await sendLove("kiss");

});


/* ============================================================
   SEND LOVE
   ============================================================ */

async function sendLove(type) {

    if (!currentUser) {

        return;

    }


    // Prevent accidental double-clicks.

    const button =
        type === "hug"
            ? hugButton
            : kissButton;


    button.disabled = true;


    const { data, error } =
        await supabase
            .from(TABLE_NAME)
            .insert({
                type: type,
                sender: currentUser
            })
            .select()
            .single();


    button.disabled = false;


    if (error) {

        console.error(
            "Could not send love:",
            error
        );

        showMessage(
            "⚠️",
            "Couldn't send it",
            "Something went wrong sending your love."
        );

        return;

    }


    /*
       Add the newly-created action immediately.

       Realtime will also notify this page, but we don't
       want to wait for that notification before updating
       the UI.
    */

    addActionToState(data);


    /* ========================================================
       SHOW MESSAGE
       ======================================================== */

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

}


/* ============================================================
   ADD ACTION TO STATE
   ============================================================ */

function addActionToState(action) {

    // Prevent duplicates.

    const alreadyExists =
        actions.some(
            existingAction =>
                existingAction.id === action.id
        );


    if (alreadyExists) {

        return;

    }


    actions.unshift(action);


    // Only keep the most recent 10 in the frontend.

    actions =
        actions.slice(0, 10);


    updateCounters();

    renderRecent();

}


/* ============================================================
   REALTIME
   ============================================================ */

function subscribeToActions() {

    supabase
        .channel("love-actions")
        .on(
            "postgres_changes",
            {
                event: "INSERT",
                schema: "public",
                table: TABLE_NAME
            },
            payload => {

                console.log(
                    "New love received:",
                    payload.new
                );


                addActionToState(
                    payload.new
                );


                /*
                   If somebody else sent it, show a
                   slightly different message.
                */

                if (
                    payload.new.sender !== currentUser
                ) {

                    if (
                        payload.new.type === "hug"
                    ) {

                        showMessage(
                            "🫂",
                            "You got a hug!",
                            `${payload.new.sender} just sent you a hug.`
                        );

                    } else {

                        showMessage(
                            "💋",
                            "You got a kiss!",
                            `${payload.new.sender} just sent you a kiss.`
                        );

                    }

                }

            }
        )
        .subscribe(
            (status, error) => {

                console.log(
                    "Realtime status:",
                    status
                );


                if (error) {

                    console.error(
                        "Realtime error:",
                        error
                    );

                }

            }
        );

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

    messageBox.classList.remove("pop");

    void messageBox.offsetWidth;

    messageBox.classList.add("pop");

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
            .slice(0, 10)
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
                                ${escapeHTML(
                                    action.sender
                                )}
                            </strong>

                            ${label}
                        </span>

                        <span>
                            ${formatDate(
                                action.created_at
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

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}
