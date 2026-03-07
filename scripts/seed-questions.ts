import { loadEnvConfig } from '@next/env';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env*.local
loadEnvConfig(process.cwd());

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
    process.exit(1);
}

// Create Supabase client with Service Role Key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseKey);

// Based on Prisma schema:
// option_a, option_b, option_c, option_d, option_e, correct_answer, image_url, created_at, updated_at
const questions = [
    {
        text: `Sebuah tetes minyak bermassa\n\n$$m = 1,0 \\times 10^{-4} \\text{ kg}$$\n\nberada dalam keadaan melayang diam di antara dua keping sejajar akibat adanya medan listrik seragam sebesar\n\n$$E = 400 \\text{ N/C}$$\n\nyang arahnya ke atas. Abaikan gaya hambat udara dan gaya apung.\n\nBerapakah besar dan tanda muatan listrik pada tetes minyak tersebut?`,
        category: 'WEEK_1', // Mapped to a valid Prisma enum (WEEK_1 - WEEK_7). "ELECTRICITY" is not in the schema.
        option_a: `$+2,5 \\times 10^{-6} \\text{ C}$`,
        option_b: `$-2,5 \\times 10^{-6} \\text{ C}$`,
        option_c: `$+4,0 \\times 10^{-6} \\text{ C}$`,
        option_d: `$-4,0 \\times 10^{-6} \\text{ C}$`,
        option_e: `$+1,0 \\times 10^{-6} \\text{ C}$`,
        correct_answer: 'A',
        explanation: `Karena tetes minyak melayang, maka gaya listrik sama dengan gaya berat:\n\n$$F_E = F_g$$\n\n$$qE = mg$$\n\nSehingga\n\n$$q = \\frac{mg}{E}$$\n\nSubstitusi nilai:\n\n$$q = \\frac{(1,0 \\times 10^{-4})(10)}{400}$$\n\n$$q = 2,5 \\times 10^{-6} \\text{ C}$$\n\nAgar gaya listrik ke atas (menyeimbangkan berat yang ke bawah), muatan harus positif.\n\n$$q = +2,5 \\times 10^{-6} \\text{ C}$$`,
        weight: 1
    },
    {
        text: `Sebuah partikel bermuatan\n\n$$q = 2 \\,\\mu\\text{C} = 2 \\times 10^{-6} \\text{ C}$$\n\nditempatkan di titik asal $(0,0)$. Dua partikel lain yang identik dan memiliki muatan yang sama masing-masing ditempatkan pada jarak\n\n$$r = 2 \\text{ m}$$\n\ndari titik asal, satu berada di sumbu $x$ dan satu lagi berada di sumbu $y$.\n\nBerapakah besar gaya listrik total yang dialami oleh partikel yang berada di titik asal?`,
        category: 'WEEK_1',
        option_a: `$9,0 \\times 10^{-3} \\text{ N}$`,
        option_b: `$6,4 \\times 10^{-3} \\text{ N}$`,
        option_c: `$1,3 \\times 10^{-2} \\text{ N}$`,
        option_d: `$1,8 \\times 10^{-2} \\text{ N}$`,
        option_e: `$3,6 \\times 10^{-2} \\text{ N}$`,
        correct_answer: 'B',
        explanation: `Hukum Coulomb:\n\n$$F = k \\frac{q_1 q_2}{r^2}$$\n\nDengan\n\n$$k = 9 \\times 10^{9}$$\n\nGaya dari masing-masing muatan:\n\n$$F = 9 \\times 10^{9} \\frac{(2 \\times 10^{-6})(2 \\times 10^{-6})}{2^2}$$\n\n$$F = 9 \\times 10^{-3} \\text{ N}$$\n\nKarena gaya saling tegak lurus:\n\n$$F_{\\text{total}} = \\sqrt{F^2 + F^2}$$\n\n$$F_{\\text{total}} = F\\sqrt{2}$$\n\n$$F_{\\text{total}} \\approx 6,4 \\times 10^{-3} \\text{ N}$$`,
        weight: 1
    },
    {
        text: `Tiga partikel bermuatan\n\n$$q = +3 \\,\\mu\\text{C}$$\n\nditempatkan pada bidang koordinat. Satu partikel berada di titik asal $(0,0)$, partikel kedua berada di\n\n$$(3 \\text{ m},0)$$\n\ndan partikel ketiga berada di\n\n$$(0,3 \\text{ m})$$\n\nTentukan besar gaya listrik total yang dialami oleh partikel di titik asal.`,
        category: 'WEEK_1',
        option_a: `$6,0 \\times 10^{-3} \\text{ N}$`,
        option_b: `$9,0 \\times 10^{-3} \\text{ N}$`,
        option_c: `$1,2 \\times 10^{-2} \\text{ N}$`,
        option_d: `$1,7 \\times 10^{-2} \\text{ N}$`,
        option_e: `$2,4 \\times 10^{-2} \\text{ N}$`,
        correct_answer: 'C',
        explanation: `Gaya Coulomb:\n\n$$F = k \\frac{q^2}{r^2}$$\n\n$$F = 9 \\times 10^{9} \\frac{(3 \\times 10^{-6})^2}{3^2}$$\n\n$$F = 9,0 \\times 10^{-3} \\text{ N}$$\n\nKarena arah gaya saling tegak lurus:\n\n$$F_{\\text{total}} = F\\sqrt{2}$$\n\n$$F_{\\text{total}} \\approx 1,2 \\times 10^{-2} \\text{ N}$$`,
        weight: 1
    },
    {
        text: `Dua partikel memiliki muatan\n\n$$+Q$$\n\ndan\n\n$$-Q$$\n\n(dengan besar yang sama tetapi tanda berlawanan).\n\nAgar gaya listrik total yang bekerja pada suatu muatan ketiga bernilai nol, muatan ketiga harus ditempatkan di:`,
        category: 'WEEK_1',
        option_a: `titik tengah antara muatan $Q$ dan $-Q$`,
        option_b: `pada garis bagi tegak lurus dari garis yang menghubungkan $Q$ dan $-Q$`,
        option_c: `pada garis yang menghubungkan $Q$ dan $-Q$, di sisi muatan $Q$ yang berlawanan dengan $-Q$`,
        option_d: `pada garis yang menghubungkan $Q$ dan $-Q$, di sisi muatan $-Q$ yang berlawanan dengan $Q$`,
        option_e: `tidak ada posisi yang memenuhi`,
        correct_answer: 'E',
        explanation: `Medan listrik dari muatan\n\n$$+Q$$\n\ndan\n\n$$-Q$$\n\ntidak pernah saling meniadakan pada ruang mana pun.\n\nPada titik tengah, arah medan dari kedua muatan justru searah sehingga saling menambah.\n\nPada daerah lain, besar medan tidak pernah sama dengan arah berlawanan.\n\nKarena itu tidak ada posisi di ruang yang membuat gaya total pada muatan ketiga bernilai nol.`,
        weight: 1
    },
    {
        text: `Dua muatan titik\n\n$$+Q$$\n\ndan\n\n$$-Q$$\n\nditempatkan pada suatu garis lurus dengan jarak\n\n$$2a$$\n\nsatu sama lain. Sebuah muatan uji\n\n$$+q$$\n\nakan ditempatkan di suatu titik di sekitar kedua muatan tersebut.\n\nDi manakah muatan uji harus ditempatkan agar gaya listrik total bernilai nol?`,
        category: 'WEEK_1',
        option_a: `tepat di titik tengah`,
        option_b: `pada garis penghubung di sisi $+Q$`,
        option_c: `pada garis penghubung di sisi $-Q$`,
        option_d: `pada garis bagi tegak lurus`,
        option_e: `tidak ada posisi di ruang`,
        correct_answer: 'E',
        explanation: `Karena kedua muatan memiliki besar yang sama tetapi tanda berlawanan, medan listrik yang dihasilkan tidak pernah saling meniadakan di ruang mana pun.\n\nDi titik tengah, medan listrik dari kedua muatan justru searah sehingga tidak nol.\n\nOleh karena itu tidak ada posisi yang menghasilkan gaya total nol.`,
        weight: 1
    },
    {
        text: `Dua partikel $X$ dan $Y$ terpisah sejauh\n\n$$4 \\text{ m}$$\n\nPartikel $X$ memiliki muatan\n\n$$2Q$$\n\ndan partikel $Y$ memiliki muatan\n\n$$Q$$\n\nGaya listrik yang dikerjakan oleh partikel $X$ terhadap partikel $Y$ adalah:`,
        category: 'WEEK_1',
        option_a: `dua kali gaya $Y$ terhadap $X$`,
        option_b: `setengah gaya $Y$ terhadap $X$`,
        option_c: `empat kali gaya $Y$ terhadap $X$`,
        option_d: `seperempat gaya $Y$ terhadap $X$`,
        option_e: `sama besar dengan gaya $Y$ terhadap $X$`,
        correct_answer: 'E',
        explanation: `Menurut hukum Coulomb:\n\n$$F = k \\frac{q_1 q_2}{r^2}$$\n\nGaya yang bekerja antara dua muatan selalu memenuhi\n\n$$F_{XY} = F_{YX}$$\n\nHal ini sesuai dengan Hukum III Newton, yaitu gaya aksi dan reaksi memiliki besar yang sama tetapi arah berlawanan.\n\nSehingga\n\n$$F_{XY} = F_{YX}$$`,
        weight: 1
    },
    {
        text: `Sebuah kapasitor bermuatan dihubungkan secara seri dengan sebuah induktor. Pada saat\n\n$$t = 0$$\n\narus dalam rangkaian bernilai nol, tetapi kapasitor memiliki muatan maksimum. Jika\n\n$$T$$\n\nadalah periode osilasi rangkaian tersebut, maka waktu berikutnya setelah\n\n$$t=0$$\n\nketika arus mencapai nilai maksimum adalah:`,
        category: 'WEEK_7',
        option_a: `$T$`,
        option_b: `$T/4$`,
        option_c: `$T/2$`,
        option_d: `$T$`,
        option_e: `$2T$`,
        correct_answer: 'B',
        explanation: `Dalam rangkaian LC, muatan kapasitor berubah secara sinusoidal:\n\n$$q = q_{\\max}\\cos(\\omega t)$$\n\nArus adalah turunan dari muatan:\n\n$$i = -\\omega q_{\\max}\\sin(\\omega t)$$\n\nPada saat\n\n$$t = 0$$\n\nmuatan maksimum dan arus nol.\n\nArus maksimum terjadi ketika\n\n$$\\sin(\\omega t) = 1$$\n\nyaitu saat\n\n$$\\omega t = \\frac{\\pi}{2}$$\n\nKarena periode osilasi\n\n$$T = \\frac{2\\pi}{\\omega}$$\n\nmaka\n\n$$t = \\frac{T}{4}$$`,
        weight: 1
    },
    {
        text: `Sebuah kapasitor bermuatan dihubungkan secara seri dengan sebuah induktor. Pada saat\n\n$$t = 0$$\n\narus dalam rangkaian nol tetapi kapasitor bermuatan maksimum.\n\nJika\n\n$$T$$\n\nadalah periode osilasi, maka waktu berikutnya setelah\n\n$$t=0$$\n\nketika muatan pada kapasitor maksimum adalah:`,
        category: 'WEEK_7',
        option_a: `$T$`,
        option_b: `$T/4$`,
        option_c: `$T/2$`,
        option_d: `$T$`,
        option_e: `$2T$`,
        correct_answer: 'C',
        explanation: `Muatan kapasitor mengikuti persamaan\n\n$$q = q_{\\max}\\cos(\\omega t)$$\n\nMuatan maksimum terjadi ketika\n\n$$\\cos(\\omega t) = \\pm1$$\n\nSetelah waktu awal\n\n$$t=0$$\n\nmuatan maksimum berikutnya terjadi ketika\n\n$$\\omega t = \\pi$$\n\nSehingga\n\n$$t = \\frac{T}{2}$$`,
        weight: 1
    },
    {
        text: `Sebuah kapasitor bermuatan dihubungkan secara seri dengan sebuah induktor. Pada saat\n\n$$t = 0$$\n\narus nol tetapi kapasitor bermuatan.\n\nJika\n\n$$T$$\n\nadalah periode osilasi, maka waktu berikutnya ketika tegangan pada induktor maksimum adalah:`,
        category: 'WEEK_7',
        option_a: `$T$`,
        option_b: `$T/4$`,
        option_c: `$T/2$`,
        option_d: `$T$`,
        option_e: `$2T$`,
        correct_answer: 'B',
        explanation: `Dalam rangkaian osilasi LC (Induktor-Kapasitor) ideal yang dirangkai seri, energi terus berosilasi antara medan listrik di dalam kapasitor dan medan magnet di dalam induktor. Berdasarkan Hukum Kirchhoff untuk Tegangan (KVL), jumlah tegangan dalam loop tertutup adalah nol:\n$$V_C + V_L = 0 \\implies V_L = -V_C$$\nIni berarti, magnitudo (besar) tegangan pada induktor akan selalu sebanding dengan magnitudo tegangan pada kapasitor ($|V_L| = |V_C|$).\n\nMari kita analisis siklus osilasinya (dengan $T$ sebagai satu periode penuh):\n\n1. **Pada $t = 0$**:\n   Kapasitor dalam keadaan terisi penuh (muatan maksimum). Arus $I = 0$. Tegangan pada kapasitor ($V_C$) bernilai maksimum. Akibatnya, tegangan pada induktor ($V_L$) juga bernilai **maksimum**.\n\n2. **Pada $t = \\frac{T}{4}$ (Seperempat Periode)**:\n   Kapasitor kosong sepenuhnya (muatan nol). Seluruh energi telah berpindah menjadi medan magnet di induktor. Arus mencapai nilai maksimum, namun tegangan induktor dan kapasitor bernilai **nol** ($V_C = 0$, $V_L = 0$).\n\n3. **Pada $t = \\frac{T}{2}$ (Setengah Periode)**:\n   Arus kembali menjadi nol karena kapasitor kembali terisi penuh, namun dengan **polaritas muatan yang terbalik** dari kondisi awal. Karena muatannya kembali maksimum (meski terbalik), magnitudo tegangan kapasitor ($V_C$) kembali maksimum. Oleh karena itu, magnitudo tegangan induktor ($V_L$) juga mencapai nilai **maksimumnya kembali**.\n\nJadi, waktu terdekat setelah $t = 0$ di mana tegangan induktor kembali mencapai nilai maksimumnya adalah pada $t = \\frac{T}{2}$.`,
        weight: 1
    },
    {
        text: `Sebuah kapasitor bermuatan dihubungkan secara seri dengan sebuah induktor. Pada saat\n\n$$t = 0$$\n\narus nol tetapi kapasitor bermuatan.\n\nJika\n\n$$T$$\n\nadalah periode osilasi, maka waktu berikutnya ketika energi medan magnet pada induktor maksimum adalah:`,
        category: 'WEEK_7',
        option_a: `$T$`,
        option_b: `$T/4$`,
        option_c: `$T/2$`,
        option_d: `$T$`,
        option_e: `$2T$`,
        correct_answer: 'B',
        explanation: `Energi pada induktor adalah\n\n$$U_B = \\frac{1}{2}Li^2$$\n\nEnergi maksimum terjadi saat arus maksimum.\n\nSeperti telah ditunjukkan sebelumnya, arus maksimum pertama kali terjadi pada\n\n$$t = \\frac{T}{4}$$`,
        weight: 1
    },
    {
        text: `Sebuah kapasitor bermuatan dihubungkan secara seri dengan sebuah induktor. Pada saat\n\n$$t = 0$$\n\narus nol tetapi kapasitor bermuatan maksimum.\n\nJika\n\n$$T$$\n\nadalah periode osilasi, maka waktu berikutnya ketika energi listrik pada kapasitor maksimum adalah:`,
        category: 'WEEK_7',
        option_a: `$T$`,
        option_b: `$T/4$`,
        option_c: `$T/2$`,
        option_d: `$T$`,
        option_e: `$2T$`,
        correct_answer: 'C',
        explanation: `Energi listrik pada kapasitor adalah\n\n$$U_E = \\frac{q^2}{2C}$$\n\nEnergi maksimum terjadi saat muatan maksimum.\n\nMuatan maksimum berikutnya terjadi setelah setengah periode:\n\n$$t = \\frac{T}{2}$$`,
        weight: 1
    },
    {
        text: `Sebuah kapasitor dalam osilator LC memiliki beda potensial maksimum\n\n$$V_{\\max} = 15 \\text{ V}$$\n\ndan energi maksimum\n\n$$U_{\\max} = 360 \\,\\mu\\text{J}$$\n\nPada suatu saat tertentu energi pada kapasitor adalah\n\n$$U = 40 \\,\\mu\\text{J}$$\n\nBerapakah beda potensial pada kapasitor saat itu?`,
        category: 'WEEK_7',
        option_a: `$0$`,
        option_b: `$5 \\text{ V}$`,
        option_c: `$10 \\text{ V}$`,
        option_d: `$15 \\text{ V}$`,
        option_e: `$20 \\text{ V}$`,
        correct_answer: 'B',
        explanation: `Energi kapasitor:\n\n$$U = \\frac{1}{2}CV^2$$\n\nEnergi maksimum:\n\n$$U_{\\max} = \\frac{1}{2}CV_{\\max}^2$$\n\nPerbandingan:\n\n$$\\frac{U}{U_{\\max}} = \\frac{V^2}{V_{\\max}^2}$$\n\nSubstitusi nilai:\n\n$$\\frac{40}{360} = \\frac{V^2}{15^2}$$\n\n$$\\frac{1}{9} = \\frac{V^2}{225}$$\n\n$$V^2 = 25$$\n\n$$V = 5 \\text{ V}$$`,
        weight: 1
    },
    {
        text: `Manakah perubahan berikut yang paling besar menurunkan frekuensi osilasi suatu rangkaian LC?\n\nFrekuensi rangkaian LC:\n\n$$f = \\frac{1}{2\\pi\\sqrt{LC}}$$\n\nJika komponen diganti menjadi:`,
        category: 'WEEK_7',
        option_a: `$L/2$ dan $C/2$`,
        option_b: `$L/2$ dan $2C$`,
        option_c: `$2L$ dan $C/2$`,
        option_d: `$2L$ dan $2C$`,
        option_e: `tidak ada perubahan`,
        correct_answer: 'D',
        explanation: `Frekuensi:\n\n$$f \\propto \\frac{1}{\\sqrt{LC}}$$\n\nJika\n\n$$L \\rightarrow 2L$$\n\ndan\n\n$$C \\rightarrow 2C$$\n\nmaka\n\n$$LC \\rightarrow 4LC$$\n\nSehingga\n\n$$f' = \\frac{1}{\\sqrt{4LC}} = \\frac{f}{2}$$\n\nFrekuensi menjadi paling kecil.`,
        weight: 1
    },
    {
        text: `Kita ingin membuat rangkaian LC yang berosilasi pada frekuensi\n\n$$f = 100 \\text{ Hz}$$\n\ndengan induktansi\n\n$$L = 2.5 \\text{ H}$$\n\nBerapakah kapasitansi yang diperlukan?`,
        category: 'WEEK_7',
        option_a: `$1 \\text{ F}$`,
        option_b: `$1 \\text{ mF}$`,
        option_c: `$1 \\,\\mu\\text{F}$`,
        option_d: `$100 \\,\\mu\\text{F}$`,
        option_e: `$1 \\text{ pF}$`,
        correct_answer: 'C',
        explanation: `Frekuensi resonansi osilasi pada sebuah rangkaian LC (Induktor-Kapasitor) dirumuskan dengan persamaan:\n$$f = \\frac{1}{2\\pi\\sqrt{LC}}$$\n\nDiketahui:\n* Frekuensi ($f$) = $100 \\text{ Hz}$\n* Induktansi ($L$) = $2,5 \\text{ H}$\n\nDitanya: Kapasitansi ($C$) = ?\n\nUntuk mencari nilai $C$, kita kuadratkan kedua ruas persamaan di atas terlebih dahulu untuk menghilangkan akar:\n$$f^2 = \\frac{1}{4\\pi^2 L C}$$\n\nKemudian kita susun ulang persamaannya untuk mencari $C$:\n$$C = \\frac{1}{4\\pi^2 L f^2}$$\n\nMasukkan nilai-nilai yang diketahui ke dalam persamaan:\n$$C = \\frac{1}{4 \\cdot \\pi^2 \\cdot 2,5 \\cdot (100)^2}$$\n$$C = \\frac{1}{10 \\cdot \\pi^2 \\cdot 10.000}$$\n$$C = \\frac{1}{100.000 \\cdot \\pi^2}$$\n\nDalam banyak perhitungan fisika dasar, nilai $\\pi^2$ sering kali didekati dengan nilai $\\approx 10$ untuk menyederhanakan perhitungan secara manual. Jika kita menggunakan pendekatan $\\pi^2 = 10$:\n$$C = \\frac{1}{100.000 \\cdot 10}$$\n$$C = \\frac{1}{1.000.000}$$\n$$C = 10^{-6} \\text{ F}$$\n\nKarena $1 \\, \\mu\\text{F} = 10^{-6} \\text{ F}$, maka besar kapasitansi yang dibutuhkan adalah:\n$$C = 1 \\, \\mu\\text{F}$$`,
        weight: 1
    },
    {
        text: `Sebuah rangkaian LC terdiri dari kapasitor\n\n$$C = 1 \\,\\mu\\text{F}$$\n\ndan induktor\n\n$$L = 4 \\text{ mH}$$\n\nFrekuensi osilasinya kira-kira adalah:`,
        category: 'WEEK_7',
        option_a: `$0.025 \\text{ Hz}$`,
        option_b: `$25 \\text{ Hz}$`,
        option_c: `$60 \\text{ Hz}$`,
        option_d: `$2500 \\text{ Hz}$`,
        option_e: `$15{,}800 \\text{ Hz}$`,
        correct_answer: 'D',
        explanation: `$$f = \\frac{1}{2\\pi\\sqrt{LC}}$$\n\nSubstitusi:\n\n$$L = 4 \\times 10^{-3}$$\n\n$$C = 1 \\times 10^{-6}$$\n\n$$LC = 4 \\times 10^{-9}$$\n\n$$\\sqrt{LC} = 2 \\times 10^{-4.5}$$\n\nSehingga\n\n$$f \\approx 2.5 \\times 10^3 \\text{ Hz}$$\n\n$$f \\approx 2500 \\text{ Hz}$$`,
        weight: 1
    },
    {
        text: `Sebuah rangkaian LC memiliki frekuensi osilasi\n\n$$f = 10^5 \\text{ Hz}$$\n\nJika\n\n$$C = 0.1 \\,\\mu\\text{F}$$\n\nmaka nilai induktansi kira-kira adalah:`,
        category: 'WEEK_7',
        option_a: `$10 \\text{ mH}$`,
        option_b: `$1 \\text{ mH}$`,
        option_c: `$25 \\,\\mu\\text{H}$`,
        option_d: `$2.5 \\,\\mu\\text{H}$`,
        option_e: `$1 \\text{ pH}$`,
        correct_answer: 'C',
        explanation: `Frekuensi osilasi:\n\n$$f = \\frac{1}{2\\pi\\sqrt{LC}}$$\n\nSehingga\n\n$$L = \\frac{1}{(2\\pi f)^2 C}$$\n\nSubstitusi:\n\n$$C = 0.1 \\times 10^{-6}$$\n\n$$f = 10^5$$\n\nHasil perhitungan memberi nilai sekitar\n\n$$L \\approx 25 \\,\\mu\\text{H}$$`,
        weight: 1
    }
];

async function seedDatabase() {
    console.log('Inserting questions into Supabase...');

    const questionsWithId = questions.map(q => ({
        ...q,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
        .from('questions')
        .insert(questionsWithId)
        .select();

    if (error) {
        console.error('Failed to seed database:', error.message, error.details, error.hint);
        process.exit(1);
    }

    console.log(`Successfully inserted ${data?.length || 0} questions into the database.`);
}

seedDatabase()
    .catch((e) => {
        console.error('Unhandled error during seeding:', e);
        process.exit(1);
    });
