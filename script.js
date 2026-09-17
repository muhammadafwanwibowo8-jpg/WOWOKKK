```javascript
/* ==========================================
   SUPABASE
========================================== */

// NANTI GANTI DENGAN DATA SUPABASE KAMU

const SUPABASE_URL =
    "MASUKKAN_SUPABASE_URL_KAMU";

const SUPABASE_ANON_KEY =
    "MASUKKAN_SUPABASE_ANON_KEY_KAMU";


/* ==========================================
   CONNECT SUPABASE
========================================== */

let supabaseClient = null;

if (
    SUPABASE_URL !== "MASUKKAN_SUPABASE_URL_KAMU" &&
    SUPABASE_ANON_KEY !== "MASUKKAN_SUPABASE_ANON_KEY_KAMU"
) {

    supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY
        );
}


/* ==========================================
   MOBILE MENU
========================================== */

const menuToggle =
    document.getElementById("menuToggle");

const navMenu =
    document.getElementById("navMenu");


menuToggle.addEventListener("click", () => {

    navMenu.classList.toggle("active");

});


document.querySelectorAll("nav a").forEach(link => {

    link.addEventListener("click", () => {

        navMenu.classList.remove("active");

    });

});


/* ==========================================
   YEAR
========================================== */

document.getElementById("year").textContent =
    new Date().getFullYear();


/* ==========================================
   COMMENT ELEMENTS
========================================== */

const commentForm =
    document.getElementById("commentForm");

const commentName =
    document.getElementById("commentName");

const commentText =
    document.getElementById("commentText");

const commentButton =
    document.getElementById("commentButton");

const commentStatus =
    document.getElementById("commentStatus");

const commentsContainer =
    document.getElementById("commentsContainer");

const commentCount =
    document.getElementById("commentCount");


/* ==========================================
   STATUS
========================================== */

function setStatus(message) {

    commentStatus.textContent = message;

}


/* ==========================================
   DATE
========================================== */

function formatDate(dateString) {

    const date =
        new Date(dateString);

    return date.toLocaleDateString(
        "id-ID",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}


/* ==========================================
   LOAD COMMENTS
========================================== */

async function loadComments() {

    if (!supabaseClient) {

        commentsContainer.innerHTML = `
            <div class="no-comments">
                Database belum dihubungkan.
            </div>
        `;

        commentCount.textContent = "0";

        return;

    }


    commentsContainer.innerHTML = `
        <div class="loading">
            Memuat komentar...
        </div>
    `;


    const {
        data,
        error
    } = await supabaseClient

        .from("comments")

        .select(
            "id, name, comment, created_at"
        )

        .order(
            "created_at",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(
            "Gagal mengambil komentar:",
            error
        );

        commentsContainer.innerHTML = `
            <div class="no-comments">
                Komentar belum dapat dimuat.
            </div>
        `;

        return;

    }


    commentCount.textContent =
        data.length;


    if (data.length === 0) {

        commentsContainer.innerHTML = `
            <div class="no-comments">
                Belum ada komentar.
                Jadilah yang pertama berkomentar.
            </div>
        `;

        return;

    }


    commentsContainer.innerHTML = "";


    data.forEach(item => {

        const commentItem =
            document.createElement("div");

        commentItem.className =
            "comment-item";


        const header =
            document.createElement("div");

        header.className =
            "comment-header";


        const name =
            document.createElement("span");

        name.className =
            "comment-name";

        name.textContent =
            item.name;


        const date =
            document.createElement("span");

        date.className =
            "comment-date";

        date.textContent =
            formatDate(
                item.created_at
            );


        const text =
            document.createElement("div");

        text.className =
            "comment-text";

        /*
            textContent digunakan supaya
            komentar tidak bisa memasukkan
            HTML/JavaScript berbahaya.
        */

        text.textContent =
            item.comment;


        header.appendChild(name);

        header.appendChild(date);

        commentItem.appendChild(header);

        commentItem.appendChild(text);

        commentsContainer.appendChild(
            commentItem
        );

    });

}


/* ==========================================
   SEND COMMENT
========================================== */

commentForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        if (!supabaseClient) {

            setStatus(
                "Database belum terhubung."
            );

            return;

        }


        const name =
            commentName.value.trim();

        const comment =
            commentText.value.trim();


        if (!name || !comment) {

            setStatus(
                "Nama dan komentar wajib diisi."
            );

            return;

        }


        if (name.length > 50) {

            setStatus(
                "Nama maksimal 50 karakter."
            );

            return;

        }


        if (comment.length > 500) {

            setStatus(
                "Komentar maksimal 500 karakter."
            );

            return;

        }


        commentButton.disabled = true;

        commentButton.textContent =
            "Mengirim...";

        setStatus("");


        const {
            error
        } = await supabaseClient

            .from("comments")

            .insert([
                {
                    name: name,
                    comment: comment
                }
            ]);


        if (error) {

            console.error(
                "Gagal mengirim komentar:",
                error
            );

            setStatus(
                "Komentar gagal dikirim. Silakan coba lagi."
            );

            commentButton.disabled = false;

            commentButton.textContent =
                "Kirim Komentar";

            return;

        }


        commentForm.reset();


        setStatus(
            "Komentar berhasil dikirim ✓"
        );


        commentButton.disabled = false;

        commentButton.textContent =
            "Kirim Komentar";


        await loadComments();

    }
);


/* ==========================================
   REALTIME
========================================== */

function enableRealtime() {

    if (!supabaseClient) {
        return;
    }


    supabaseClient

        .channel("comments-channel")

        .on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "comments"
            },
            () => {

                loadComments();

            }
        )

        .subscribe();

}


/* ==========================================
   START WEBSITE
========================================== */

loadComments();

enableRealtime();
```
