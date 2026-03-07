export const week4Questions = [
    {
        text: `Satuan dari hambatan jenis (resistivitas) adalah:`,
        category: 'WEEK_4',
        option_a: `$\text{ohm}$`,
        option_b: `$\text{ohm}\cdot\text{meter}$`,
        option_c: `$\text{ohm/meter}$`,
        option_d: `$\text{ohm/meter}^2$`,
        option_e: `Tidak ada pilihan di atas yang benar`,
        correct_answer: 'B',
        explanation: `Hambatan ($R$) sebuah kawat penghantar dipengaruhi oleh panjang ($L$), luas penampang ($A$), dan hambatan jenis atau resistivitas ($\rho$), dirumuskan dengan:
$$R = \rho \frac{L}{A}$$
Susun ulang persamaan untuk mencari satuan resistivitas ($\rho$):
$$\rho = \frac{R \cdot A}{L}$$
Masukkan satuan standarnya:
$$\rho = \frac{\Omega \cdot \text{m}^2}{\text{m}}$$
$$\rho = \Omega \cdot \text{m} \quad (\text{ohm}\cdot\text{meter})$$`,
        weight: 1
    },
    {
        text: `Arus listrik memiliki satuan:`,
        category: 'WEEK_4',
        option_a: `$\text{kilowatt}\cdot\text{jam}$`,
        option_b: `$\text{ampere}$`,
        option_c: `$\text{coulomb}$`,
        option_d: `$\text{volt}$`,
        option_e: `$\text{ohm}$`,
        correct_answer: 'B',
        explanation: `Di dalam Sistem Satuan Internasional (SI), arus listrik merupakan salah satu besaran pokok yang satuannya ditetapkan dengan nama **Ampere (A)**.`,
        weight: 1
    },
    {
        text: `Arus listrik memiliki satuan:`,
        category: 'WEEK_4',
        option_a: `$\text{kilowatt}\cdot\text{jam}$`,
        option_b: `$\text{coulomb/sekon}$`,
        option_c: `$\text{coulomb}$`,
        option_d: `$\text{volt}$`,
        option_e: `$\text{ohm}$`,
        correct_answer: 'B',
        explanation: `Sesuai dengan definisi besaran fisika, arus listrik ($I$) adalah banyaknya muatan listrik ($Q$) yang mengalir melewati penampang konduktor tiap satuan waktu ($t$).
$$I = \frac{dQ}{dt}$$
Muatan memiliki satuan Coulomb ($\text{C}$) dan waktu memiliki satuan sekon ($\text{s}$). Maka satuan arus setara dengan **coulomb per sekon** ($\text{C/s}$), yang juga kita kenal sebagai Ampere ($\text{A}$).`,
        weight: 1
    },
    {
        text: `Sebuah aki mobil memiliki spesifikasi (kapasitas) $80 \text{ A}\cdot\text{h}$. Ampere-jam (A·h) adalah satuan dari:`,
        category: 'WEEK_4',
        option_a: `Daya`,
        option_b: `Energi`,
        option_c: `Arus`,
        option_d: `Muatan`,
        option_e: `Gaya`,
        correct_answer: 'D',
        explanation: `Arus listrik ($I$) adalah laju aliran muatan listrik ($Q$) terhadap waktu ($t$):
$$I = \frac{Q}{t} \implies Q = I \cdot t$$
Satuan Ampere-jam (Ampere dikali jam) merepresentasikan Arus dikali Waktu, yang tidak lain adalah satuan untuk **Muatan**. 
Dalam SI, $1 \text{ Ampere} \cdot 1 \text{ sekon} = 1 \text{ Coulomb}$. 
Jadi, $1 \text{ A}\cdot\text{h} = 1 \text{ A} \times 3600 \text{ s} = 3600 \text{ C}$.`,
        weight: 1
    },
    {
        text: `Laju penggunaan energi listrik dapat diukur dalam satuan:`,
        category: 'WEEK_4',
        option_a: `$\text{watt/sekon}$`,
        option_b: `$\text{watt}\cdot\text{sekon}$`,
        option_c: `$\text{watt}$`,
        option_d: `$\text{joule}\cdot\text{sekon}$`,
        option_e: `$\text{kilowatt}\cdot\text{jam}$`,
        correct_answer: 'C',
        explanation: `"Laju penggunaan energi" adalah definisi murni dari besaran **Daya ($P$)**. Daya menyatakan seberapa besar energi ($E$) yang digunakan per satuan waktu ($t$):
$$P = \frac{E}{t}$$
Satuannya adalah Joule/sekon ($\text{J/s}$), yang secara baku dinamakan **Watt**.`,
        weight: 1
    },
    {
        text: `Energi dapat diukur dalam satuan:`,
        category: 'WEEK_4',
        option_a: `$\text{kilowatt}$`,
        option_b: `$\text{joule}\cdot\text{sekon}$`,
        option_c: `$\text{watt}$`,
        option_d: `$\text{watt}\cdot\text{sekon}$`,
        option_e: `$\text{volt/ohm}$`,
        correct_answer: 'D',
        explanation: `Daya ($P$) adalah energi ($E$) dibagi waktu ($t$), sehingga rumus energi dapat ditulis:
$$E = P \cdot t$$
Jika Daya memiliki satuan Watt ($\text{W}$) dan Waktu memiliki satuan sekon ($\text{s}$), maka Energi dapat diukur menggunakan satuan **$\text{watt}\cdot\text{sekon}$** (satuan ini persis setara dengan 1 Joule).`,
        weight: 1
    },
    {
        text: `Besaran manakah di bawah ini yang dipasangkan dengan satuan yang tepat?`,
        category: 'WEEK_4',
        option_a: `Daya – $\text{kW}\cdot\text{h}$`,
        option_b: `Energi – $\text{kW}$`,
        option_c: `Beda potensial – $\text{J/C}$`,
        option_d: `Arus – $\text{A/s}$`,
        option_e: `Hambatan – $\text{V/C}$`,
        correct_answer: 'C',
        explanation: `Mari kita evaluasi seluruh pasangan opsi tersebut:
* A. **Daya**: Satuannya Watt ($\text{W}$) atau kilowatt ($\text{kW}$). (Salah, kW·h adalah satuan energi).
* B. **Energi**: Satuannya Joule atau kilowatt-jam ($\text{kW}\cdot\text{h}$). (Salah, kW adalah satuan daya).
* C. **Beda Potensial**: Tegangan ($V$) adalah usaha/energi ($W$) per satuan muatan ($q$). $V = \frac{W}{q}$, satuannya **Joule/Coulomb ($\text{J/C}$)**. (Benar, 1 J/C = 1 Volt).
* D. **Arus**: Satuannya Ampere ($\text{A}$). (Salah, bukan A/s).
* E. **Hambatan**: Satuannya Ohm ($\Omega$) atau Volt/Ampere ($\text{V/A}$). (Salah, bukan V/C).`,
        weight: 1
    },
    {
        text: `Arus listrik merupakan ukuran dari:`,
        category: 'WEEK_4',
        option_a: `Gaya yang memindahkan muatan melewati suatu titik`,
        option_b: `Hambatan terhadap pergerakan muatan melewati suatu titik`,
        option_c: `Energi yang digunakan untuk memindahkan muatan melewati suatu titik`,
        option_d: `Jumlah muatan yang melewati suatu titik per satuan waktu`,
        option_e: `Kelajuan sebuah muatan bergerak melewati suatu titik`,
        correct_answer: 'D',
        explanation: `Sesuai definisi fundamental pada persamaan $I = \frac{dq}{dt}$, arus listrik di dalam rangkaian adalah laju aliran partikel-partikel bermuatan. Ini diukur dari seberapa banyak (jumlah) muatan Coulomb yang mengalir melewati suatu penampang per satuan waktu (detik).`,
        weight: 1
    },
    {
        text: `Sebuah bohlam berdaya $60 \text{ watt}$ dialiri arus sebesar $0,5 \text{ A}$. Total muatan yang melewatinya dalam kurun waktu satu jam adalah:`,
        category: 'WEEK_4',
        option_a: `$120 \text{ C}$`,
        option_b: `$3600 \text{ C}$`,
        option_c: `$3000 \text{ C}$`,
        option_d: `$2400 \text{ C}$`,
        option_e: `$1800 \text{ C}$`,
        correct_answer: 'E',
        explanation: `Untuk mencari muatan yang mengalir, nilai daya bohlam ($60 \text{ W}$) sebenarnya tidak diperlukan (pengecoh). Kita hanya memerlukan besar arus dan waktu:
$$Q = I \cdot t$$
Diketahui:
* Arus ($I$) = $0,5 \text{ A}$
* Waktu ($t$) = $1 \text{ jam} = 3600 \text{ sekon}$
Masukkan nilainya ke dalam rumus:
$$Q = 0,5 \times 3600$$
$$Q = 1800 \text{ C}$$`,
        weight: 1
    },
    {
        text: `Sebuah resistor $10 \, \Omega$ dialiri arus yang konstan. Jika muatan sebesar $1200 \text{ C}$ mengalir melewatinya dalam waktu $4 \text{ menit}$, berapakah nilai arusnya?`,
        category: 'WEEK_4',
        option_a: `$3,0 \text{ A}$`,
        option_b: `$5,0 \text{ A}$  *(Jawaban yang benar secara matematis)*`,
        option_c: `$11 \text{ A}$`,
        option_d: `$15 \text{ A}$  *(Kunci jawaban asli pembuat soal)*`,
        option_e: `$20 \text{ A}$`,
        correct_answer: 'B',
        explanation: `Hambatan resistor ($10 \, \Omega$) hanyalah distraksi dalam soal ini. Untuk mencari arus, kita gunakan definisi dasar:
$$I = \frac{Q}{t}$$
Diketahui:
* Muatan ($Q$) = $1200 \text{ C}$
* Waktu ($t$) = $4 \text{ menit} = 4 \times 60 \text{ sekon} = 240 \text{ sekon}$
Masukkan ke dalam rumus:
$$I = \frac{1200}{240}$$
$$I = 5 \text{ A}$$
*(Catatan untuk mahasiswa: Kunci jawaban asli soal (D. $15 \text{ A}$) adalah salah. Itu terjadi jika sang pembuat soal langsung membagi 1200 dengan 80 tanpa alasan matematis yang jelas, atau salah memasukkan konversi waktu).*`,
        weight: 1
    },
    {
        text: `Pernyataan "Jumlah arus yang masuk ke suatu titik cabang sama dengan jumlah arus yang keluar dari titik cabang tersebut" merupakan konsekuensi dari:`,
        category: 'WEEK_4',
        option_a: `Hukum Ketiga Newton`,
        option_b: `Hukum Ohm`,
        option_c: `Hukum Kedua Newton`,
        option_d: `Kekekalan Energi`,
        option_e: `Kekekalan Muatan`,
        correct_answer: 'E',
        explanation: `Pernyataan tersebut secara resmi dinamakan sebagai **Hukum I Kirchhoff** (Kirchhoff's Current Law / KCL): $\sum I_{masuk} = \sum I_{keluar}$.
Karena arus tidak lain adalah aliran muatan listrik, maka jika total muatan yang mengalir masuk persis sama dengan yang keluar, hal ini membuktikan bahwa tidak ada muatan yang tercipta dari ketiadaan atau musnah (hilang) di dalam titik cabang tersebut. Ini merupakan manifestasi dari prinsip fisika fundamental: **Kekekalan Muatan**.`,
        weight: 1
    },
    {
        text: `Pernyataan "Jumlah GGL dan beda potensial di sekitar suatu loop tertutup sama dengan nol" merupakan konsekuensi dari:`,
        category: 'WEEK_4',
        option_a: `Hukum Ketiga Newton`,
        option_b: `Hukum Ohm`,
        option_c: `Hukum Kedua Newton`,
        option_d: `Kekekalan Energi`,
        option_e: `Kekekalan Muatan`,
        correct_answer: 'D',
        explanation: `Pernyataan tersebut adalah bunyi dari **Hukum II Kirchhoff** (Kirchhoff's Voltage Law / KVL): $\sum \varepsilon + \sum IR = 0$.
Beda potensial (tegangan) adalah usaha (energi) yang dibutuhkan untuk memindahkan satu satuan muatan listrik positif. Mengelilingi satu lintasan loop tertutup berarti membawa muatan berangkat dari satu titik, melewati berbagai komponen sirkuit, dan kembali tepat ke titik yang sama. Perubahan energi potensial bersihnya pasti **nol** karena kita kembali ke keadaan energi semula. Ini adalah prinsip **Kekekalan Energi**.`,
        weight: 1
    },
    {
        text: `Empat buah kawat bertemu di sebuah titik cabang. Kawat pertama mengalirkan arus $4 \text{ A}$ masuk ke titik cabang, kawat kedua mengalirkan arus $5 \text{ A}$ keluar dari titik cabang, dan kawat ketiga mengalirkan arus $2 \text{ A}$ keluar dari titik cabang. Kawat keempat mengalirkan arus:`,
        category: 'WEEK_4',
        option_a: `$7 \text{ A}$ keluar dari titik cabang`,
        option_b: `$7 \text{ A}$ masuk ke titik cabang`,
        option_c: `$3 \text{ A}$ keluar dari titik cabang`,
        option_d: `$3 \text{ A}$ masuk ke titik cabang`,
        option_e: `$1 \text{ A}$ masuk ke titik cabang`,
        correct_answer: 'D',
        explanation: `Terapkan Hukum I Kirchhoff (KCL):
$$\sum I_{masuk} = \sum I_{keluar}$$
Mari jumlahkan arus yang sudah diketahui:
* Arus Keluar (Kawat 2 + Kawat 3): $5 \text{ A} + 2 \text{ A} = 7 \text{ A}$
* Arus Masuk (Kawat 1): $4 \text{ A}$
Sistem tidak seimbang. Agar total arus masuk juga sama dengan $7 \text{ A}$, maka Kawat keempat wajib menambahkan arus sebesar:
$7 \text{ A} - 4 \text{ A} = 3 \text{ A}$ dengan arah **masuk ke titik cabang**.`,
        weight: 1
    },
    {
        text: `Dalam konteks aturan loop dan percabangan (Hukum Kirchhoff) pada rangkaian listrik, sebuah titik cabang (*junction*) adalah:`,
        category: 'WEEK_4',
        option_a: `Tempat di mana kawat dihubungkan ke sebuah resistor`,
        option_b: `Tempat di mana kawat dihubungkan ke sebuah baterai`,
        option_c: `Tempat di mana hanya dua kawat yang dihubungkan`,
        option_d: `Tempat di mana tiga atau lebih kawat saling dihubungkan`,
        option_e: `Tempat di mana kawat dibengkokkan`,
        correct_answer: 'D',
        explanation: `Dalam analisis *node* (simpul) rangkaian listrik, sebuah simpul baru bisa disebut sebagai "titik cabang" sejati secara matematis jika arus yang melaluinya dapat **terbagi atau bergabung**. Kondisi ini hanya bisa terjadi jika ada minimal **tiga buah jalur kawat** yang saling bertemu. Jika hanya dua kawat yang disambung (A-B), komponen tersebut terhubung secara seri dan arusnya dipastikan sama rata sehingga tidak membentuk percabangan baru.`,
        weight: 1
    },
    {
        text: `Untuk rangkaian apa pun, jumlah persamaan independen yang mengandung nilai GGL, hambatan, dan arus listrik di dalamnya adalah sama dengan:`,
        category: 'WEEK_4',
        option_a: `Jumlah titik cabang`,
        option_b: `Jumlah titik cabang dikurangi 1`,
        option_c: `Jumlah cabang`,
        option_d: `Jumlah cabang dikurangi 1`,
        option_e: `Jumlah loop tertutup`,
        correct_answer: 'C',
        explanation: `Dalam memecahkan sirkuit multiloop, setiap kabel tunggal yang menghubungkan satu titik cabang ke titik cabang lainnya disebut sebagai **cabang (*branch*)**. Di setiap cabang ini, mengalir tepat satu variabel arus (misal: $I_1, I_2, I_3$).
Oleh karena itu, total ada sebanyak $B$ (*Branch*) nilai arus yang tidak kita ketahui. Berdasarkan aljabar linier, untuk memecahkan $B$ variabel yang tidak diketahui, kita diwajibkan menyusun secara persis sejumlah $B$ persamaan independen.`,
        weight: 1
    },
    {
        text: `Jika suatu rangkaian memiliki $L$ buah loop tertutup, $B$ buah cabang, dan $J$ buah titik cabang, jumlah persamaan loop independen yang bisa dibuat adalah:`,
        category: 'WEEK_4',
        option_a: `$B - J + 1$`,
        option_b: `$B - J$`,
        option_c: `$B$`,
        option_d: `$L$`,
        option_e: `$L - J$`,
        correct_answer: 'A',
        explanation: `Menurut teori graf sirkuit dan hukum Kirchhoff:
1. Total persamaan independen mutlak yang kita butuhkan untuk menyelesaikan sirkuit adalah sebanyak jumlah cabang ($B$).
2. Dari jumlah total tersebut, Hukum Kirchhoff 1 (Titik Cabang) akan memberikan kita persamaan linier mandiri sebanyak $(J - 1)$.
3. Kekurangan sisanya harus dipenuhi dengan menggunakan persamaan dari Hukum Kirchhoff 2 (Loop).
Maka, sisa persamaan (jumlah persamaan loop independen) adalah:
$$\text{Persamaan Loop} = \text{Total Persamaan} - \text{Persamaan Cabang}$$
$$\text{Persamaan Loop} = B - (J - 1)$$
$$\text{Persamaan Loop} = B - J + 1$$`,
        weight: 1
    },
    {
        text: `Sebuah baterai dihubungkan melintasi kombinasi SERI dua resistor identik. Jika beda potensial pada terminal baterai adalah $V$ dan arus pada baterai adalah $i$, maka:`,
        category: 'WEEK_4',
        option_a: `Beda potensial pada tiap resistor adalah $V$ dan arus pada tiap resistor adalah $i$`,
        option_b: `Beda potensial pada tiap resistor adalah $V/2$ dan arus pada tiap resistor adalah $i/2$`,
        option_c: `Beda potensial pada tiap resistor adalah $V$ dan arus pada tiap resistor adalah $i/2$`,
        option_d: `Beda potensial pada tiap resistor adalah $V/2$ dan arus pada tiap resistor adalah $i$`,
        option_e: `Tidak ada pilihan di atas yang benar`,
        correct_answer: 'D',
        explanation: `Karakteristik **Rangkaian Seri**:
1. **Arus (i) sama rata di setiap tempat:** Hanya ada satu jalur sirkuit, sehingga arus yang keluar dari baterai tidak terbagi. Arus yang melewati setiap resistor adalah utuh **$i$**.
2. **Tegangan terbagi:** Beda potensial total baterai ($V$) dibagi-bagi ke setiap komponen. Karena kedua komponen tersebut adalah resistor yang identik (nilainya sama-sama $R$), maka baterai akan membagi tegangan secara simetris, yaitu masing-masing mendapatkan **$V/2$**.`,
        weight: 1
    },
    {
        text: `Sebuah baterai dihubungkan melintasi kombinasi PARALEL dua resistor identik. Jika beda potensial pada terminal baterai adalah $V$ dan arus pada baterai adalah $i$, maka:`,
        category: 'WEEK_4',
        option_a: `Beda potensial pada tiap resistor adalah $V$ dan arus pada tiap resistor adalah $i$`,
        option_b: `Beda potensial pada tiap resistor adalah $V/2$ dan arus pada tiap resistor adalah $i/2$`,
        option_c: `Beda potensial pada tiap resistor adalah $V$ dan arus pada tiap resistor adalah $i/2$`,
        option_d: `Beda potensial pada tiap resistor adalah $V/2$ dan arus pada tiap resistor adalah $i$`,
        option_e: `Tidak ada pilihan di atas yang benar`,
        correct_answer: 'C',
        explanation: `Karakteristik **Rangkaian Paralel**:
1. **Tegangan (V) sama rata di setiap cabang:** Setiap cabang kabel langsung terkoneksi ke kutub-kutub baterai, sehingga beda potensial di tiap resistor adalah utuh sama dengan sumber, yaitu **$V$**.
2. **Arus terbagi:** Arus dari baterai ($i$) akan terpecah ketika menemui titik percabangan. Karena kedua resistor hambatannya identik, arus akan "milih" untuk terbagi persis sama rata ke kedua jalur. Maka, arus di tiap resistor adalah **$i/2$**.`,
        weight: 1
    },
    {
        text: `Hambatan total sebesar $3,0 \, \Omega$ akan dihasilkan dengan menggabungkan sebuah resistor yang tidak diketahui nilainya, $R$, dengan sebuah resistor $12 \, \Omega$. Berapakah nilai $R$ dan bagaimana cara menghubungkannya dengan resistor $12 \, \Omega$ tersebut?`,
        category: 'WEEK_4',
        option_a: `$4,0 \, \Omega$, paralel`,
        option_b: `$4,0 \, \Omega$, seri`,
        option_c: `$2,4 \, \Omega$, paralel`,
        option_d: `$2,4 \, \Omega$, seri`,
        option_e: `$9,0 \, \Omega$, seri`,
        correct_answer: 'A',
        explanation: `Nilai hambatan pengganti yang ditargetkan ($3,0 \, \Omega$) **lebih kecil** daripada nilai resistor awal yang tersedia ($12 \, \Omega$). Di dalam fisika listrik, satu-satunya cara membuat hambatan total menjadi "lebih kecil" dari hambatan penyusunnya adalah dengan memecah jalur listriknya, yaitu menggunakan **rangkaian paralel**.
Gunakan rumus hambatan pengganti paralel:
$$\frac{1}{R_{tot}} = \frac{1}{R_1} + \frac{1}{R}$$
$$\frac{1}{3} = \frac{1}{12} + \frac{1}{R}$$
Pindahkan ruas:
$$\frac{1}{R} = \frac{1}{3} - \frac{1}{12}$$
$$\frac{1}{R} = \frac{4}{12} - \frac{1}{12}$$
$$\frac{1}{R} = \frac{3}{12}$$
$$R = \frac{12}{3} = 4 \, \Omega$$`,
        weight: 1
    },
    {
        text: `Dengan hanya menggunakan dua buah resistor, $R_1$ dan $R_2$, seorang siswa dapat meracik dan memperoleh hambatan total dengan empat variasi nilai: $3 \, \Omega$, $4 \, \Omega$, $12 \, \Omega$, dan $16 \, \Omega$. Nilai dari $R_1$ dan $R_2$ (dalam ohm) tersebut adalah:`,
        category: 'WEEK_4',
        option_a: `$3$ dan $4$`,
        option_b: `$2$ dan $12$`,
        option_c: `$3$ dan $16$`,
        option_d: `$4$ dan $12$`,
        option_e: `$4$ dan $16$`,
        correct_answer: 'D',
        explanation: `Jika kita punya 2 buah resistor unik, kita memang bisa menghasilkan maksimal **4 nilai hambatan berbeda** dengan konfigurasi:
1. Hanya menggunakan Resistor 1
2. Hanya menggunakan Resistor 2
3. Menggunakan Rangkaian Seri keduanya ($R_1 + R_2$)
4. Menggunakan Rangkaian Paralel keduanya ($\frac{R_1 R_2}{R_1 + R_2}$)
Dari nilai target $3 \, \Omega, 4 \, \Omega, 12 \, \Omega$, dan $16 \, \Omega$, hal yang paling jelas terlihat adalah:
* Hambatan Seri pasti menghasilkan nilai **paling besar** dari kumpulan tersebut $\implies R_1 + R_2 = 16 \, \Omega$.
* Jika kita melihat opsi (A sampai E), satu-satunya pasangan opsi yang jika dijumlahkan bernilai 16 adalah Opsi D ($4 + 12 = 16$).
Mari kita buktikan nilai Paralelnya untuk validasi:
$$R_{paralel} = \frac{4 \times 12}{4 + 12} = \frac{48}{16} = 3 \, \Omega$$
Sesuai dengan target. Jadi nilai $R_1$ dan $R_2$ masing-masing adalah $4 \, \Omega$ dan $12 \, \Omega$.`,
        weight: 1
    },
];
