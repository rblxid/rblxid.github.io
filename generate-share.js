const fs = require("fs");
const path = require("path");

const DATA_REPO =
    "https://raw.githubusercontent.com/RobloxIndonesia/robloxindonesia.github.io/main/users/user/";

const DATA_SITE =
    "https://robloxindonesia.github.io";

const SHARE_SITE =
    "https://rblxid.github.io";

const PROFIL_SITE =
    "https://robloxindonesia.github.io/users/profil.html?user=";

const SHARE_DIR =
    path.join(
        __dirname,
        "users",
        "share"
    );


// ========================================
// AMBIL TANGGAL ARSIP DARI copiedAt
// ========================================

function getTanggalArsip(copiedAt) {

    const date =
        new Date(copiedAt);

    if (
        isNaN(
            date.getTime()
        )
    ) {
        return null;
    }

    const tahun =
        date.getUTCFullYear();

    const bulan =
        String(
            date.getUTCMonth() + 1
        ).padStart(2, "0");

    const hari =
        date.getUTCDate();

    const tanggal =
        hari >= 16
            ? "16"
            : "01";

    return (
        `${tahun}-${bulan}-${tanggal}`
    );
}


// ========================================
// AMBIL JSON
// ========================================

async function ambilData(
    username
) {

    const url =
        DATA_REPO +
        encodeURIComponent(username) +
        ".json";

    const response =
        await fetch(url);

    if (
        !response.ok
    ) {

        console.log(
            `Gagal mengambil ${username}.json`
        );

        return null;
    }

    return await response.json();
}


// ========================================
// BUAT HALAMAN SHARE
// ========================================

function buatHalaman(
    username,
    data
) {

    const id =
        data.id;

    const nama =
        data.name ||
        data.username ||
        username;

    const displayName =
        data.displayName ||
        nama;

    const tanggal =
        getTanggalArsip(
            data.copiedAt
        );


    // ====================================
    // URL GAMBAR AVATAR
    // ====================================

    let imageUrl =
        `${DATA_SITE}/favicon.png`;

    if (
        id &&
        tanggal
    ) {

        imageUrl =
            `${DATA_SITE}/users/data/` +
            `${tanggal}/assets/` +
            `${encodeURIComponent(nama)}/` +
            `${id}-${encodeURIComponent(nama)}` +
            `-headshot.png`;
    }


    // ====================================
    // URL SHARE
    // ====================================

    const shareUrl =
        `${SHARE_SITE}/users/share/` +
        `${encodeURIComponent(username)}/`;


    // ====================================
    // URL PROFIL ASLI
    // ====================================

    const profilUrl =
        `${PROFIL_SITE}` +
        `${encodeURIComponent(username)}`;


    // ====================================
    // FOLDER SHARE
    // ====================================

    const folder =
        path.join(
            SHARE_DIR,
            username
        );

    fs.mkdirSync(
        folder,
        {
            recursive: true
        }
    );


    // ====================================
    // HTML
    // ====================================

    const html = `<!DOCTYPE html>
<html lang="id">

<head>

<meta charset="UTF-8">

<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
>

<title>
${displayName} (@${nama}) - Roblox Indonesia
</title>

<meta
    name="description"
    content="Profil Roblox ${displayName} (@${nama}) di Roblox Indonesia."
>

<link
    rel="canonical"
    href="${shareUrl}"
>


<!-- OPEN GRAPH -->

<meta
    property="og:type"
    content="profile"
>

<meta
    property="og:title"
    content="${displayName} (@${nama}) - Roblox Indonesia"
>

<meta
    property="og:description"
    content="Profil Roblox ${displayName} (@${nama}) di Roblox Indonesia."
>

<meta
    property="og:url"
    content="${shareUrl}"
>

<meta
    property="og:image"
    content="${imageUrl}"
>

<meta
    property="og:image:alt"
    content="Avatar ${displayName}"
>


<!-- TWITTER / X -->

<meta
    name="twitter:card"
    content="summary"
>

<meta
    name="twitter:title"
    content="${displayName} (@${nama}) - Roblox Indonesia"
>

<meta
    name="twitter:description"
    content="Profil Roblox ${displayName} (@${nama}) di Roblox Indonesia."
>

<meta
    name="twitter:image"
    content="${imageUrl}"
>

<meta
    name="twitter:image:alt"
    content="Avatar ${displayName}"
>


<!-- PENGALIHAN -->

<meta
    http-equiv="refresh"
    content="0;url=${profilUrl}"
>

<script>

window.location.replace(
    ${JSON.stringify(profilUrl)}
);

</script>

</head>

<body>

<p>
Membuka profil Roblox...
</p>

<p>

<a href="${profilUrl}">
Buka profil ${displayName}
</a>

</p>

</body>

</html>`;


    fs.writeFileSync(
        path.join(
            folder,
            "index.html"
        ),
        html,
        "utf8"
    );


    console.log(
        `✓ ${username}`
    );

    console.log(
        `  tanggal: ${tanggal}`
    );

    console.log(
        `  gambar: ${imageUrl}`
    );
}


// ========================================
// AMBIL DAFTAR USER
// ========================================

async function main() {

    const usersUrl =
        "https://raw.githubusercontent.com/" +
        "RobloxIndonesia/robloxindonesia.github.io/" +
        "main/users/data/users.json";


    const response =
        await fetch(
            usersUrl
        );


    if (
        !response.ok
    ) {

        throw new Error(
            "Gagal mengambil users.json"
        );
    }


    const usersData =
        await response.json();


    const users =
        usersData.users || [];


    console.log(
        `Jumlah user: ${users.length}`
    );


    for (
        const user of users
    ) {

        const username =
            user.username;

        if (!username) {
            continue;
        }


        try {

            const data =
                await ambilData(
                    username
                );


            if (!data) {
                continue;
            }


            buatHalaman(
                username,
                data
            );


        } catch (error) {

            console.log(
                `✗ ${username}:`,
                error.message
            );
        }
    }
}


main()
    .catch(
        error => {

            console.error(
                error
            );

            process.exit(1);
        }
    );
