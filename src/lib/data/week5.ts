export const week5Questions = [
    {
        text: `Satuan dari medan magnet dapat berupa:
A. $\text{C}\cdot\text{m/s}$
B. $\text{C}\cdot\text{s/m}$
C. $\text{C/kg}$
D. $\text{kg/C}\cdot\text{s}$
E. $\text{N/C}\cdot\text{m}$`,
        category: 'WEEK_5',
        option_a: ``,
        option_b: ``,
        option_c: ``,
        option_d: ``,
        option_e: null,
        correct_answer: 'D',
        explanation: `Kita dapat menurunkan satuan medan magnet dari rumus Gaya Lorentz pada partikel yang bergerak lurus tegak lurus terhadap medan magnet:
$$F = q \cdot v \cdot B$$
$$B = \frac{F}{q \cdot v}$$
Mari kita urai satuannya ke dalam Satuan Internasional (SI) dasar:
* Gaya ($F$) memiliki satuan Newton ($\text{N}$). $1 \text{ N} = 1 \text{ kg}\cdot\text{m/s}^2$
* Muatan ($q$) memiliki satuan Coulomb ($\text{C}$)
* Kecepatan ($v$) memiliki satuan $\text{m/s}$
Masukkan satuan-satuan tersebut:
$$B = \frac{\text{kg}\cdot\text{m/s}^2}{\text{C} \cdot (\text{m/s})}$$
$$B = \frac{\text{kg}\cdot\text{m/s}^2}{\text{C}\cdot\text{m} / \text{s}}$$
$$B = \frac{\text{kg}}{\text{C}\cdot\text{s}}$$`,
        weight: 1
    },
    {
        text: `Dalam rumus $\vec{F} = q\vec{v} \times \vec{B}$:
A. $\vec{F}$ harus tegak lurus terhadap $\vec{v}$ tetapi tidak harus terhadap $\vec{B}$
B. $\vec{F}$ harus tegak lurus terhadap $\vec{B}$ tetapi tidak harus terhadap $\vec{v}$
C. $\vec{v}$ harus tegak lurus terhadap $\vec{B}$ tetapi tidak harus terhadap $\vec{F}$
D. Ketiga vektor tersebut harus saling tegak lurus
E. $\vec{F}$ harus tegak lurus terhadap $\vec{v}$ dan juga $\vec{B}$`,
        category: 'WEEK_5',
        option_a: ``,
        option_b: ``,
        option_c: ``,
        option_d: ``,
        option_e: null,
        correct_answer: 'E',
        explanation: `Rumus di atas menggunakan operasi **perkalian silang vektor (cross product)** antara vektor kecepatan ($\vec{v}$) dan vektor medan magnet ($\vec{B}$). 
Secara matematis, hasil dari perkalian silang dua buah vektor akan *selalu* menghasilkan vektor ketiga yang posisinya **tegak lurus terhadap kedua vektor pembentuknya**. Oleh karena itu, vektor gaya ($\vec{F}$) pasti akan selalu tegak lurus terhadap $\vec{v}$ dan sekaligus tegak lurus terhadap $\vec{B}$, berapapun sudut antara $\vec{v}$ dan $\vec{B}$ itu sendiri.`,
        weight: 1
    },
    {
        text: `Pada titik mana pun, garis-garis medan magnet memiliki arah yang sama dengan:
A. Gaya magnet pada partikel bermuatan positif yang bergerak
B. Gaya magnet pada partikel bermuatan negatif yang bergerak
C. Kecepatan partikel bermuatan positif yang bergerak
D. Kecepatan partikel bermuatan negatif yang bergerak
E. Tidak ada pilihan di atas yang benar`,
        category: 'WEEK_5',
        option_a: ``,
        option_b: ``,
        option_c: ``,
        option_d: ``,
        option_e: null,
        correct_answer: 'E',
        explanation: `Garis-garis medan magnet merepresentasikan arah **medan magnet** ($\vec{B}$) itu sendiri. 
* Gaya magnet ($\vec{F}$) selalu tegak lurus terhadap medan magnet (sehingga tidak mungkin searah).
* Kecepatan partikel ($\vec{v}$) bisa mengarah ke mana saja bebas, tidak terikat secara absolut dengan arah medan magnet.
Maka, garis medan magnet tidak searah dengan gaya maupun kecepatan pada umumnya.`,
        weight: 1
    },
    {
        text: `Gaya magnet pada partikel bermuatan akan searah dengan kecepatannya jika:
A. Partikel bergerak searah dengan medan magnet
B. Partikel bergerak berlawanan arah dengan medan magnet
C. Partikel bergerak tegak lurus terhadap medan magnet
D. Partikel bergerak ke arah lain
E. Tidak pernah`,
        category: 'WEEK_5',
        option_a: ``,
        option_b: ``,
        option_c: ``,
        option_d: ``,
        option_e: null,
        correct_answer: 'E',
        explanation: `Berdasarkan sifat perkalian silang ($\vec{F} = q\vec{v} \times \vec{B}$), vektor gaya Lorentz ($\vec{F}$) secara definitif **selalu tegak lurus** terhadap vektor kecepatannya ($\vec{v}$). Oleh karena itu, tidak akan pernah ada kondisi di mana gaya magnet bisa sejajar atau searah dengan arah gerak partikelnya.`,
        weight: 1
    },
    {
        text: `Medan magnet memberikan gaya pada partikel bermuatan:
A. Selalu
B. Tidak pernah
C. Jika partikel bergerak memotong garis medan
D. Jika partikel bergerak di sepanjang garis medan
E. Jika partikel dalam keadaan diam`,
        category: 'WEEK_5',
        option_a: ``,
        option_b: ``,
        option_c: ``,
        option_d: ``,
        option_e: null,
        correct_answer: 'C',
        explanation: `Besar gaya magnet dirumuskan dengan:
$$F = qvB \sin\theta$$
Dimana $\theta$ adalah sudut antara kecepatan ($v$) dan medan magnet ($B$).
* Jika diam ($v = 0$), maka $F = 0$.
* Jika bergerak di sepanjang garis medan (sejajar, $\theta = 0^\circ$ atau $180^\circ$), maka $\sin(0) = 0$, sehingga $F = 0$.
* Agar gaya dapat bekerja, partikel harus bergerak dan membentuk sudut memotong garis medan (misalnya tegak lurus), sehingga nilai $\sin\theta \neq 0$.`,
        weight: 1
    },
    {
        text: `Arah medan magnet di suatu wilayah ruang ditentukan dengan menembakkan muatan uji ke wilayah tersebut dengan kecepatannya ke berbagai arah dalam percobaan yang berbeda-beda. Arah medan tersebut adalah:
A. Salah satu arah kecepatan ketika gaya magnetnya bernilai nol
B. Arah kecepatan ketika gaya magnetnya bernilai maksimum
C. Arah dari gaya magnetnya itu sendiri
D. Tegak lurus terhadap kecepatan ketika gaya magnetnya bernilai nol
E. Tidak ada pilihan di atas yang benar`,
        category: 'WEEK_5',
        option_a: ``,
        option_b: ``,
        option_c: ``,
        option_d: ``,
        option_e: null,
        correct_answer: 'A',
        explanation: `Berdasarkan rumus gaya Lorentz $F = qvB \sin\theta$, gaya akan bernilai **nol** hanya jika $\sin\theta = 0$. Hal ini terjadi pada dua kondisi sudut:
1. $\theta = 0^\circ$ (kecepatan partikel searah/sejajar dengan arah medan magnet).
2. $\theta = 180^\circ$ (kecepatan partikel berlawanan arah secara persis dengan arah medan magnet).
Jadi, jika kita menemukan arah tembakan di mana partikel tidak mengalami gaya sama sekali ($F=0$), maka bisa dipastikan arah medan magnet tersebut sejajar dengan garis arah tembakan (kecepatan) tersebut.`,
        weight: 1
    },
    {
        text: `Sebuah elektron bergerak ke utara di wilayah di mana medan magnet mengarah ke selatan. Gaya magnet yang bekerja pada elektron adalah:
A. Nol
B. Ke atas
C. Ke bawah
D. Ke timur
E. Ke barat`,
        category: 'WEEK_5',
        option_a: ``,
        option_b: ``,
        option_c: ``,
        option_d: ``,
        option_e: null,
        correct_answer: 'A',
        explanation: `Elektron bergerak ke **Utara**, sementara medan magnet mengarah ke **Selatan**. Ini berarti arah gerak elektron dan arah medan magnet berlawanan arah secara persis (anti-paralel).
Sudut yang dibentuk antara kecepatan ($\vec{v}$) dan medan magnet ($\vec{B}$) adalah $\theta = 180^\circ$.
Besar gaya magnetnya:
$$F = qvB \sin(180^\circ) = qvB (0) = 0$$
Maka, tidak ada gaya magnet yang bekerja pada elektron.`,
        weight: 1
    },
    {
        text: `Medan magnet TIDAK DAPAT:
A. Memberikan gaya pada partikel bermuatan
B. Mengubah kecepatan *(velocity/vektor)* dari partikel bermuatan
C. Mengubah momentum dari partikel bermuatan
D. Mengubah energi kinetik dari partikel bermuatan
E. Mengubah lintasan dari partikel bermuatan`,
        category: 'WEEK_5',
        option_a: ``,
        option_b: ``,
        option_c: ``,
        option_d: ``,
        option_e: null,
        correct_answer: 'D',
        explanation: `Karena gaya magnet selalu tegak lurus terhadap arah gerak (perpindahan) partikel, maka usaha ($W$) yang dilakukan oleh gaya magnet adalah nol ($W = F \cdot s \cos 90^\circ = 0$).
Berdasarkan Teorema Usaha-Energi, perubahan energi kinetik sama dengan usaha total yang dilakukan ($\Delta EK = W$). Karena usahanya nol, maka **energi kinetik partikel selalu konstan** (kelajuannya tidak bisa bertambah cepat atau lambat). Gaya magnet hanya bisa mengubah "arah" kecepatan partikel, bukan nilai kelajuannya.`,
        weight: 1
    },
    {
        text: `Sebuah proton (muatan $e$), bergerak tegak lurus terhadap medan magnet, mengalami gaya yang sama besar dengan partikel alfa (muatan $2e$) yang juga bergerak tegak lurus terhadap medan yang sama. Rasio kecepatan mereka, $v_{proton} / v_{alfa}$, adalah:
A. $0,5$
B. $1$
C. $2$
D. $4$
E. $8$`,
        category: 'WEEK_5',
        option_a: ``,
        option_b: ``,
        option_c: ``,
        option_d: ``,
        option_e: null,
        correct_answer: 'C',
        explanation: `Gaya Lorentz dirumuskan dengan $F = qvB \sin(90^\circ) = qvB$.
Diketahui bahwa gaya pada proton sama dengan gaya pada partikel alfa:
$$F_{proton} = F_{alfa}$$
$$q_p \cdot v_p \cdot B = q_\alpha \cdot v_\alpha \cdot B$$
Coret $B$ di kedua ruas dan masukkan nilai muatannya ($q_p = e$ dan $q_\alpha = 2e$):
$$e \cdot v_p = (2e) \cdot v_\alpha$$
$$v_p = 2 \cdot v_\alpha$$
Maka rasio kecepatannya adalah:
$$\frac{v_{proton}}{v_{alfa}} = \frac{v_p}{v_\alpha} = 2$$`,
        weight: 1
    },
    {
        text: `Sebuah atom hidrogen yang telah kehilangan elektronnya bergerak ke timur di wilayah di mana medan magnet diarahkan dari selatan ke utara. Atom tersebut akan dibelokkan ke arah:
A. Atas
B. Bawah
C. Utara
D. Selatan
E. Tidak dibelokkan sama sekali`,
        category: 'WEEK_5',
        option_a: ``,
        option_b: ``,
        option_c: ``,
        option_d: ``,
        option_e: null,
        correct_answer: 'A',
        explanation: `Atom hidrogen yang kehilangan elektronnya hanya tersisa intinya saja, yaitu sebuah **proton** yang bermuatan **positif**. 
Gunakan Kaidah Tangan Kanan untuk muatan positif:
* Ibu jari (kecepatan $\vec{v}$) menunjuk ke **Timur**.
* Keempat jari telunjuk (medan magnet $\vec{B}$) menunjuk ke **Utara**.
* Arah dorongan telapak tangan (gaya $\vec{F}$) menunjuk **ke Atas** (keluar dari bidang orientasi).
Oleh karena itu, proton tersebut akan didorong dan dibelokkan ke **atas**.`,
        weight: 1
    },
    {
        text: `Satuan yang sesuai untuk permeabilitas ruang hampa ($\mu_0$) adalah:
A. $\text{tesla}$
B. $\text{newton/ampere}^2$
C. $\text{weber/meter}$
D. $\text{kilogram}\cdot\text{ampere/meter}$
E. $\text{tesla}\cdot\text{meter/ampere}$`,
        category: 'WEEK_5',
        option_a: ``,
        option_b: ``,
        option_c: ``,
        option_d: ``,
        option_e: null,
        correct_answer: 'E',
        explanation: `Ambil salah satu rumus yang mengandung $\mu_0$, contohnya rumus medan magnet pada kawat lurus panjang (Hukum Ampere):
$$B = \frac{\mu_0 \cdot I}{2\pi \cdot r}$$
Susun ulang persamaan untuk mencari satuan $\mu_0$:
$$\mu_0 = \frac{B \cdot 2\pi \cdot r}{I}$$
Mengingat konstanta $2\pi$ tidak memiliki besaran dimensi, satuannya adalah:
* $B$ = Tesla ($\text{T}$)
* $r$ = meter ($\text{m}$)
* $I$ = Ampere ($\text{A}$)
Maka, satuan $\mu_0$ adalah **$\text{T}\cdot\text{m/A}$** (Tesla meter per Ampere).`,
        weight: 1
    },
    {
        text: `Satu "coulomb" adalah:
A. Satu ampere per detik
B. Jumlah muatan yang akan memberikan gaya sebesar $1 \text{ N}$ pada muatan serupa pada jarak $1 \text{ m}$
C. Jumlah arus pada masing-masing dari dua kawat panjang sejajar, yang terpisah sejauh $1 \text{ m}$, yang menghasilkan gaya sebesar $2 \times 10^{-7} \text{ N/m}$
D. Jumlah muatan yang mengalir melewati suatu titik dalam satu detik ketika arusnya adalah $1 \text{ A}$
E. Sebuah singkatan untuk kombinasi tertentu dari kilogram, meter, dan detik`,
        category: 'WEEK_5',
        option_a: ``,
        option_b: ``,
        option_c: ``,
        option_d: ``,
        option_e: null,
        correct_answer: 'D',
        explanation: `Secara fundamental, arus listrik ($I$) didefinisikan sebagai laju aliran muatan listrik ($q$) terhadap waktu ($t$):
$$I = \frac{q}{t}$$
$$q = I \cdot t$$
Dalam Satuan Internasional (SI):
$$1 \text{ Coulomb} = 1 \text{ Ampere} \times 1 \text{ sekon}$$
Jadi, 1 Coulomb secara definitif adalah jumlah muatan listrik yang mengalir melalui konduktor dalam waktu 1 detik saat arus yang mengalir adalah sebesar 1 Ampere.`,
        weight: 1
    },
    {
        text: `Garis-garis medan magnet yang dihasilkan oleh kawat lurus panjang berarus adalah berbentuk:
A. Searah dengan arah arus
B. Berlawanan arah dengan arah arus
C. Mengarah keluar secara radial dari kawat
D. Mengarah ke dalam secara radial menuju kawat
E. Lingkaran-lingkaran yang sepusat (konsentris) dengan kawat`,
        category: 'WEEK_5',
        option_a: ``,
        option_b: ``,
        option_c: ``,
        option_d: ``,
        option_e: null,
        correct_answer: 'E',
        explanation: `Berdasarkan Kaidah Tangan Kanan (Kaidah Genggaman), jika kawat lurus berarus digenggam dengan tangan kanan sedemikian rupa sehingga arah ibu jari menunjuk arah arus, maka putaran keempat jari lainnya akan menunjukkan arah medan magnet. Bentuk yang dihasilkan oleh putaran keempat jari ini secara alami membentuk lintasan berupa **lingkaran-lingkaran yang mengelilingi kawat secara konsentris**.`,
        weight: 1
    },
    {
        text: `Pada sebuah kawat lurus yang membentang di atas kepala (*overhead*), arus mengalir ke arah utara. Medan magnet akibat arus ini, pada titik pengamatan kita (berada di bawah kawat tersebut), mengarah ke:
A. Timur
B. Atas
C. Utara
D. Bawah
E. Barat`,
        category: 'WEEK_5',
        option_a: ``,
        option_b: ``,
        option_c: ``,
        option_d: ``,
        option_e: null,
        correct_answer: 'E',
        explanation: `Kita gunakan Kaidah Genggaman Tangan Kanan:
1. Posisikan kawat imajiner di atas kepala Anda.
2. Arahkan ibu jari Anda ke **Utara** (searah arus listrik).
3. Karena Anda (titik pengamat) berada di **bawah** kawat, tempatkan keempat jari Anda menggulung melingkar ke posisi di bawah kawat tersebut.
4. Di bagian bawah kawat, ujung keempat jari Anda akan menunjuk ke arah **Barat**.`,
        weight: 1
    },
    {
        text: `Sebuah kawat yang membawa arus besar $i$ dari timur ke barat ditempatkan di atas sebuah kompas magnetik biasa. Ujung jarum kompas yang ditandai "N" (Utara) akan menunjuk ke arah:
A. Utara
B. Selatan
C. Timur
D. Barat
E. Kompas akan bertindak sebagai motor listrik, sehingga jarum akan terus berputar`,
        category: 'WEEK_5',
        option_a: ``,
        option_b: ``,
        option_c: ``,
        option_d: ``,
        option_e: null,
        correct_answer: 'B',
        explanation: `Secara alami, jarum kompas "N" akan menunjuk arah medan magnet dominan di sekitarnya (dalam hal ini, medan magnet kawat akan jauh lebih besar mengalahkan medan magnet Bumi).
Gunakan Kaidah Genggaman Tangan Kanan:
1. Ibu jari menunjuk arah **Barat** (arus mengalir dari Timur ke Barat).
2. Posisi kompas berada di **bawah** kawat.
3. Gulung keempat jari Anda melewati bagian bawah kawat. Ujung jari Anda akan menunjuk lurus ke arah **Selatan**. 
Maka, jarum Utara kompas tersebut akan dipaksa menyimpang menunjuk ke arah **Selatan**.`,
        weight: 1
    },
    {
        text: `Medan magnet di luar sebuah kawat lurus panjang berarus bergantung pada jarak $R$ dari sumbu kawat menurut hubungan:
A. $R$
B. $1/R$
C. $1/R^2$
D. $1/R^3$
E. $1/R^{3/2}$`,
        category: 'WEEK_5',
        option_a: ``,
        option_b: ``,
        option_c: ``,
        option_d: ``,
        option_e: null,
        correct_answer: 'B',
        explanation: `Rumus besar medan magnet ($B$) yang dihasilkan oleh kawat lurus panjang berarus sejauh $R$ dari kawat didasarkan pada Hukum Ampere (Hukum Biot-Savart):
$$B = \frac{\mu_0 \cdot I}{2\pi \cdot R}$$
Dari rumus di atas, terlihat jelas bahwa medan magnet berbanding lurus dengan arus ($I$) dan **berbanding terbalik dengan jaraknya ($R$)**, sehingga proporsional dengan $1/R$.`,
        weight: 1
    },
    {
        text: `Medan magnet pada jarak $2 \text{ cm}$ dari sebuah kawat lurus panjang berarus adalah $2,0 \times 10^{-5} \text{ T}$. Arus dalam kawat tersebut adalah:
A. $0,16 \text{ A}$
B. $1,0 \text{ A}$
C. $2,0 \text{ A}$
D. $4,0 \text{ A}$
E. $25 \text{ A}$`,
        category: 'WEEK_5',
        option_a: ``,
        option_b: ``,
        option_c: ``,
        option_d: ``,
        option_e: null,
        correct_answer: 'C',
        explanation: `Gunakan rumus medan magnet kawat lurus sejajar:
$$B = \frac{\mu_0 \cdot I}{2\pi \cdot a}$$
Dimana:
* $B = 2,0 \times 10^{-5} \text{ T}$
* $a = 2 \text{ cm} = 0,02 \text{ m}$
* $\mu_0 = 4\pi \times 10^{-7} \text{ T}\cdot\text{m/A}$
Susun ulang persamaan untuk mencari nilai arus ($I$):
$$I = \frac{B \cdot 2\pi \cdot a}{\mu_0}$$
$$I = \frac{(2,0 \times 10^{-5}) \cdot 2\pi \cdot (0,02)}{4\pi \times 10^{-7}}$$
$$I = \frac{4\pi \times 10^{-7}}{4\pi \times 10^{-7}}$$
$$I = 1,0 \times 2,0 \text{ A} = 2,0 \text{ A}$$
*(Catatan perhitungan sederhana: $\frac{2\pi}{4\pi} = \frac{1}{2}$, maka $\frac{2,0 \times 10^{-5} \times 0,02}{2 \times 10^{-7}} = 2,0 \text{ A}$).*`,
        weight: 1
    },
    {
        text: `Dua kawat lurus panjang sejajar membawa arus yang sama besar ke arah yang saling berlawanan. Pada titik tengah di antara kedua kawat tersebut, medan magnet yang dihasilkannya adalah:
A. Nol
B. Tidak nol dan berada di sepanjang garis yang menghubungkan kawat-kawat tersebut
C. Tidak nol dan sejajar dengan kawat
D. Tidak nol dan tegak lurus terhadap bidang yang dibentuk oleh kedua kawat
E. Tidak ada pilihan di atas yang benar`,
        category: 'WEEK_5',
        option_a: ``,
        option_b: ``,
        option_c: ``,
        option_d: ``,
        option_e: null,
        correct_answer: 'D',
        explanation: `Mari asumsikan kedua kawat membentang sejajar vertikal di bidang kertas. Kawat kiri arusnya ke Atas, kawat kanan arusnya ke Bawah. 
Menganalisis di titik tengah di antara kedua kawat menggunakan Kaidah Tangan Kanan:
* Kawat Kiri (arus ke atas): Di sebelah kanannya (titik tengah), medan magnetnya masuk **menembus ke dalam bidang kertas** (silang).
* Kawat Kanan (arus ke bawah): Di sebelah kirinya (titik tengah), medan magnetnya juga masuk **menembus ke dalam bidang kertas** (silang).
Karena arah medannya sama-sama menembus, mereka tidak saling meniadakan, melainkan menjumlahkan secara resultan (tidak nol). Arah yang "menembus masuk bidang" ini sifatnya **tegak lurus terhadap bidang** yang memuat kedua kawat tersebut.`,
        weight: 1
    },
    {
        text: `Dua kawat lurus panjang posisinya sejajar dan membawa arus searah. Arusnya masing-masing adalah $8,0 \text{ A}$ dan $12 \text{ A}$, dan kawat dipisahkan sejauh $0,40 \text{ cm}$. Medan magnet dalam satuan tesla pada titik tengah di antara kedua kawat adalah:
A. $0$
B. $4,0 \times 10^{-4}$
C. $8,0 \times 10^{-4}$
D. $12 \times 10^{-4}$
E. $20 \times 10^{-4}$`,
        category: 'WEEK_5',
        option_a: ``,
        option_b: ``,
        option_c: ``,
        option_d: ``,
        option_e: null,
        correct_answer: 'B',
        explanation: `Titik tengah berada tepat di tengah-tengah jarak pisah, yaitu jaraknya $a_1 = a_2 = 0,20 \text{ cm} = 0,002 \text{ m}$ dari masing-masing kawat.
Karena arus **searah**, arah vektor medan magnet dari kedua kawat di titik tengah akan **saling berlawanan arah** (menggunakan kaidah tangan kanan: yang satu masuk bidang, yang satu keluar bidang). Maka resultannya saling mengurangi ($B_{tot} = |B_1 - B_2|$).
Hitung $B_1$ (Kawat $8,0 \text{ A}$):
$$B_1 = \frac{(4\pi \times 10^{-7}) \times 8,0}{2\pi \times 0,002} = \frac{(2 \times 10^{-7}) \times 8,0}{0,002} = \frac{16 \times 10^{-7}}{2 \times 10^{-3}} = 8,0 \times 10^{-4} \text{ T}$$
Hitung $B_2$ (Kawat $12 \text{ A}$):
$$B_2 = \frac{(4\pi \times 10^{-7}) \times 12}{2\pi \times 0,002} = \frac{(2 \times 10^{-7}) \times 12}{0,002} = \frac{24 \times 10^{-7}}{2 \times 10^{-3}} = 12 \times 10^{-4} \text{ T}$$
Resultan Medan Magnet:
$$B_{tot} = 12 \times 10^{-4} - 8,0 \times 10^{-4} = 4,0 \times 10^{-4} \text{ T}$$`,
        weight: 1
    },
    {
        text: `Dua kawat lurus panjang posisinya sejajar dan membawa arus dalam arah yang saling berlawanan. Arusnya masing-masing adalah $8,0 \text{ A}$ dan $12 \text{ A}$, dan kawat dipisahkan sejauh $0,40 \text{ cm}$. Medan magnet dalam satuan tesla pada titik tengah di antara kedua kawat adalah:
A. $0$
B. $4,0 \times 10^{-4}$
C. $8,0 \times 10^{-4}$
D. $12 \times 10^{-4}$
E. $20 \times 10^{-4}$`,
        category: 'WEEK_5',
        option_a: ``,
        option_b: ``,
        option_c: ``,
        option_d: ``,
        option_e: null,
        correct_answer: 'E',
        explanation: `Kondisi ini sama persis dengan soal nomor 19, namun arah arusnya **saling berlawanan**. 
Sesuai prinsip yang kita bahas pada soal nomor 18, jika arus berlawanan arah, arah vektor medan magnet di titik tengah di antara keduanya akan menunjuk **ke arah yang sama persis**. Sehingga, resultan medan magnetnya saling **menjumlahkan** ($B_{tot} = B_1 + B_2$).
Dari perhitungan sebelumnya:
* $B_1 = 8,0 \times 10^{-4} \text{ T}$
* $B_2 = 12 \times 10^{-4} \text{ T}$
Maka Resultan Medan Magnetnya:
$$B_{tot} = (8,0 \times 10^{-4}) + (12 \times 10^{-4})$$
$$B_{tot} = 20 \times 10^{-4} \text{ T}$$`,
        weight: 1
    },
];
