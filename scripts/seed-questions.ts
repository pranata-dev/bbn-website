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
