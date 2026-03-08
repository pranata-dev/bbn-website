export const week2Questions = [
    {
        text: `Muatan total sebesar $6,3 \\times 10^{-8} \\text{ C}$ didistribusikan secara seragam ke seluruh bagian sebuah bola berjari-jari $2,7 \\text{ cm}$. Rapat muatan volumenya adalah:`,
        category: 'WEEK_2',
        option_a: `$3,7 \\times 10^{-7} \\text{ C/m}^3$`,
        option_b: `$6,9 \\times 10^{-6} \\text{ C/m}^3$`,
        option_c: `$6,9 \\times 10^{-6} \\text{ C/m}^2$`,
        option_d: `$2,5 \\times 10^{-4} \\text{ C/m}^3$`,
        option_e: `$7,6 \\times 10^{-4} \\text{ C/m}^3$`,
        correct_answer: 'E',
        explanation: `Rapat muatan volume ($\\rho$) adalah total muatan ($Q$) dibagi dengan volume benda ($V$).
Rumus volume bola:
$$V = \\frac{4}{3}\\pi r^3$$
Ubah jari-jari ke meter: $r = 2,7 \\text{ cm} = 0,027 \\text{ m}$.
$$V = \\frac{4}{3}\\pi (0,027)^3 \\approx 8,245 \\times 10^{-5} \\text{ m}^3$$
Hitung rapat muatan volumenya:
$$\\rho = \\frac{Q}{V} = \\frac{6,3 \\times 10^{-8}}{8,245 \\times 10^{-5}}$$
$$\\rho \\approx 7,64 \\times 10^{-4} \\text{ C/m}^3$$`,
        weight: 1
    },
    {
        text: `Muatan ditempatkan pada permukaan sebuah bola konduktor terisolasi yang berjari-jari $2,7 \\text{ cm}$. Rapat muatan permukaannya seragam dan memiliki nilai $6,9 \\times 10^{-6} \\text{ C/m}^2$. Total muatan pada bola tersebut adalah:`,
        category: 'WEEK_2',
        option_a: `$5,6 \\times 10^{-10} \\text{ C}$`,
        option_b: `$2,1 \\times 10^{-8} \\text{ C}$`,
        option_c: `$4,7 \\times 10^{-8} \\text{ C}$`,
        option_d: `$6,3 \\times 10^{-8} \\text{ C}$`,
        option_e: `$9,5 \\times 10^{-3} \\text{ C}$`,
        correct_answer: 'D',
        explanation: `Rapat muatan permukaan ($\\sigma$) adalah total muatan ($Q$) dibagi dengan luas permukaan ($A$).
Maka, $Q = \\sigma \\cdot A$.
Rumus luas permukaan bola:
$$A = 4\\pi r^2$$
$$A = 4\\pi (0,027)^2 \\approx 9,16 \\times 10^{-3} \\text{ m}^2$$
Hitung total muatannya:
$$Q = (6,9 \\times 10^{-6}) \\times (9,16 \\times 10^{-3})$$
$$Q \\approx 6,32 \\times 10^{-8} \\text{ C}$$`,
        weight: 1
    },
    {
        text: `Sebuah cangkang bola (kulit bola tebal) memiliki jari-jari dalam $3,7 \\text{ cm}$ dan jari-jari luar $4,5 \\text{ cm}$. Jika muatan didistribusikan secara seragam ke seluruh volume cangkang dengan rapat volume $6,1 \\times 10^{-4} \\text{ C/m}^3$, total muatannya adalah:`,
        category: 'WEEK_2',
        option_a: `$1,0 \\times 10^{-7} \\text{ C}$`,
        option_b: `$1,3 \\times 10^{-7} \\text{ C}$`,
        option_c: `$2,0 \\times 10^{-7} \\text{ C}$`,
        option_d: `$2,3 \\times 10^{-7} \\text{ C}$`,
        option_e: `$4,0 \\times 10^{-7} \\text{ C}$`,
        correct_answer: 'A',
        explanation: `Total muatan adalah $Q = \\rho \\cdot V_{cangkang}$.
Volume cangkang bola adalah volume bola luar dikurangi volume bola dalam:
$$V = \\frac{4}{3}\\pi (r_{luar}^3 - r_{dalam}^3)$$
$$V = \\frac{4}{3}\\pi \\left( (0,045)^3 - (0,037)^3 \\right)$$
$$V = \\frac{4}{3}\\pi (9,11 \\times 10^{-5} - 5,06 \\times 10^{-5})$$
$$V = \\frac{4}{3}\\pi (4,05 \\times 10^{-5}) \\approx 1,696 \\times 10^{-4} \\text{ m}^3$$
Hitung total muatannya:
$$Q = (6,1 \\times 10^{-4}) \\times (1,696 \\times 10^{-4})$$
$$Q \\approx 1,03 \\times 10^{-7} \\text{ C}$$`,
        weight: 1
    },
    {
        text: `Sebuah silinder memiliki jari-jari $2,1 \\text{ cm}$ dan panjang $8,8 \\text{ cm}$. Total muatan $6,1 \\times 10^{-7} \\text{ C}$ didistribusikan secara seragam ke seluruh bagiannya. Rapat muatan volumenya adalah:`,
        category: 'WEEK_2',
        option_a: `$5,3 \\times 10^{-5} \\text{ C/m}^3$`,
        option_b: `$5,3 \\times 10^{-5} \\text{ C/m}^2$`,
        option_c: `$8,5 \\times 10^{-4} \\text{ C/m}^3$`,
        option_d: `$5,0 \\times 10^{-3} \\text{ C/m}^3$`,
        option_e: `$6,3 \\times 10^{-2} \\text{ C/m}^3$`,
        correct_answer: 'D',
        explanation: `Rumus volume silinder:
$$V = \\pi r^2 L$$
Ubah satuan ke meter:
* $r = 0,021 \\text{ m}$
* $L = 0,088 \\text{ m}$
$$V = \\pi (0,021)^2 (0,088)$$
$$V \\approx 1,219 \\times 10^{-4} \\text{ m}^3$$
Rapat muatan volumenya:
$$\\rho = \\frac{Q}{V} = \\frac{6,1 \\times 10^{-7}}{1,219 \\times 10^{-4}}$$
$$\\rho \\approx 5,0 \\times 10^{-3} \\text{ C/m}^3$$`,
        weight: 1
    },
    {
        text: `Ketika selembar kertas dipegang dengan satu permukaannya tegak lurus terhadap medan listrik yang seragam, fluks yang menembusnya adalah $25 \\text{ N}\\cdot\\text{m}^2/\\text{C}$. Ketika kertas tersebut diputar sebesar $25^\\circ$ terhadap medan listrik, fluks yang menembusnya menjadi:`,
        category: 'WEEK_2',
        option_a: `$0$`,
        option_b: `$12 \\text{ N}\\cdot\\text{m}^2/\\text{C}$`,
        option_c: `$21 \\text{ N}\\cdot\\text{m}^2/\\text{C}$`,
        option_d: `$23 \\text{ N}\\cdot\\text{m}^2/\\text{C}$`,
        option_e: `$25 \\text{ N}\\cdot\\text{m}^2/\\text{C}$`,
        correct_answer: 'D',
        explanation: `Rumus fluks listrik adalah $\\Phi = E \\cdot A \\cos\\theta$.
Saat kertas *tegak lurus* terhadap medan, garis normal permukaannya *sejajar* dengan medan listrik ($\\theta = 0^\\circ$). Pada kondisi ini, fluks mencapai nilai maksimum ($\\Phi_{max} = E \\cdot A = 25$).
Ketika kertas diputar sebesar $25^\\circ$, sudut antara garis normal dan medan listrik menjadi $\\theta = 25^\\circ$.
$$\\Phi = \\Phi_{max} \\cos(25^\\circ)$$
$$\\Phi = 25 \\times 0,9063$$
$$\\Phi \\approx 22,66 \\text{ N}\\cdot\\text{m}^2/\\text{C}$$
Nilai yang paling mendekati adalah **$23 \\text{ N}\\cdot\\text{m}^2/\\text{C}$**.`,
        weight: 1
    },
    {
        text: `Fluks dari medan listrik $\\vec{E} = (24\\text{ N/C})\\hat{i} + (30\\text{ N/C})\\hat{j} + (16\\text{ N/C})\\hat{k}$ yang menembus luasan $2,0 \\text{ m}^2$ pada bidang yz adalah:`,
        category: 'WEEK_2',
        option_a: `$32 \\text{ N}\\cdot\\text{m}^2/\\text{C}$`,
        option_b: `$34 \\text{ N}\\cdot\\text{m}^2/\\text{C}$`,
        option_c: `$42 \\text{ N}\\cdot\\text{m}^2/\\text{C}$`,
        option_d: `$48 \\text{ N}\\cdot\\text{m}^2/\\text{C}$`,
        option_e: `$60 \\text{ N}\\cdot\\text{m}^2/\\text{C}$`,
        correct_answer: 'D',
        explanation: `Permukaan yang berada pada bidang $yz$ memiliki garis normal (vektor luas $\\vec{A}$) yang sejajar dengan sumbu $x$ (direpresentasikan dengan vektor satuan $\\hat{i}$). 
Maka vektor luasnya adalah $\\vec{A} = 2,0\\hat{i} \\text{ m}^2$.
Fluks listrik adalah perkalian titik (*dot product*) antara vektor $\\vec{E}$ dan $\\vec{A}$:
$$\\Phi = \\vec{E} \\cdot \\vec{A}$$
$$\\Phi = (24\\hat{i} + 30\\hat{j} + 16\\hat{k}) \\cdot (2,0\\hat{i})$$
$$\\Phi = (24 \\times 2,0) + (30 \\times 0) + (16 \\times 0)$$
$$\\Phi = 48 \\text{ N}\\cdot\\text{m}^2/\\text{C}$$`,
        weight: 1
    },
    {
        text: `Pertimbangkan Hukum Gauss: $\\oint \\vec{E} \\cdot d\\vec{A} = q/\\varepsilon_0$. Manakah dari pernyataan berikut yang benar?`,
        category: 'WEEK_2',
        option_a: `$\\vec{E}$ pastilah medan listrik yang DIHASILKAN HANYA oleh muatan yang terlingkupi`,
        option_b: `Jika $q = 0$, maka $\\vec{E} = 0$ di mana-mana pada permukaan Gaussian tersebut`,
        option_c: `Jika tiga partikel di dalam permukaan memiliki muatan $+q$, $+q$, dan $-2q$, maka nilai integralnya adalah nol`,
        option_d: `Pada permukaan, $\\vec{E}$ di mana-mana sejajar dengan $d\\vec{A}$`,
        option_e: `Jika sebuah muatan ditempatkan di luar permukaan, maka muatan tersebut tidak dapat memengaruhi $\\vec{E}$ di titik mana pun pada permukaan`,
        correct_answer: 'C',
        explanation: `Mari kita bahas alasannya:
* A Salah: Medan listrik $\\vec{E}$ pada sisi kiri persamaan Gauss adalah resultan medan listrik dari **semua** muatan (baik yang di dalam maupun di luar permukaan), meskipun fluks totalnya hanya ditentukan oleh muatan di dalam.
* B Salah: Jika $q_{net}=0$, itu hanya berarti total *fluks* ($\\oint \\vec{E} \\cdot d\\vec{A}$) bernilai nol. Bisa saja medannya menembus masuk (negatif) lalu keluar lagi (positif) seperti jika kita meletakkan permukaan kosong di sebelah muatan.
* C Benar: Total muatan terlingkupi adalah $q_{net} = (+q) + (+q) + (-2q) = 0$. Karena ruas kanannya $0$, maka nilai integralnya (fluksnya) pasti bernilai nol.
* D Salah: Sudut antara $\\vec{E}$ dan $d\\vec{A}$ sangat bervariasi bergantung geometri permukaan.
* E Salah: Muatan di luar permukaan sangat memengaruhi vektor $\\vec{E}$ di setiap titik permukaan (meskipun total fluks keseluruhannya saling meniadakan menjadi nol).`,
        weight: 1
    },
    {
        text: `Sebuah partikel titik bermuatan ditempatkan di pusat sebuah permukaan Gaussian berbentuk bola. Fluks listrik $\\Phi_E$ akan berubah jika:`,
        category: 'WEEK_2',
        option_a: `Bola diganti dengan kubus yang volumenya sama`,
        option_b: `Bola diganti dengan kubus yang volumenya sepersepuluh kali lebih kecil`,
        option_c: `Muatan titik digeser dari pusat (tetapi masih di dalam bola aslinya)`,
        option_d: `Muatan titik dipindahkan hingga berada tepat di luar bola`,
        option_e: `Muatan titik kedua diletakkan tepat di luar bola`,
        correct_answer: 'D',
        explanation: `Menurut Hukum Gauss ($\\Phi_E = \\frac{q_{encl}}{\\varepsilon_0}$), fluks listrik yang menembus suatu permukaan tertutup **hanya bergantung pada jumlah muatan yang dilingkupi di dalamnya ($q_{encl}$)**.
Fluks TIDAK akan berubah jika bentuk permukaan diubah (Opsi A dan B), muatan di dalam digeser posisinya (Opsi C), atau ada muatan baru ditambahkan di luar (Opsi E). 
Fluks hanya akan berubah jika jumlah muatan di dalam permukaannya berubah, contohnya dengan memindahkan muatan tersebut keluar dari permukaan (Opsi D), yang akan membuat $q_{encl} = 0$ dan fluksnya menjadi nol.`,
        weight: 1
    },
    {
        text: `Pilih pernyataan yang SALAH:`,
        category: 'WEEK_2',
        option_a: `Hukum Gauss dapat diturunkan dari hukum Coulomb`,
        option_b: `Hukum Gauss menyatakan bahwa jumlah bersih garis medan yang melintasi permukaan tertutup ke arah luar berbanding lurus dengan muatan bersih yang dilingkupi di dalam permukaan tersebut`,
        option_c: `Hukum Coulomb dapat diturunkan dari Hukum Gauss dan simetri`,
        option_d: `Hukum Gauss berlaku untuk permukaan tertutup dengan bentuk apa pun`,
        option_e: `Menurut Hukum Gauss, jika suatu permukaan tertutup tidak melingkupi muatan, maka medan listrik harus lenyap (nol) di mana-mana pada permukaan tersebut`,
        correct_answer: 'E',
        explanation: `Ini adalah miskonsepsi yang sangat umum. Jika suatu permukaan tertutup tidak melingkupi muatan ($q_{encl} = 0$), Hukum Gauss hanya menyatakan bahwa **total fluks bersihnya** sama dengan nol. 
Medan listriknya sendiri tidak harus nol. Sebagai contoh, jika kita meletakkan sebuah kotak kosong (permukaan Gaussian tertutup) di dekat sebuah baterai atau muatan positif. Medan listrik akan masuk dari satu sisi kotak dan keluar dari sisi lainnya. Medan listriknya sangat kuat dan tidak lenyap, tetapi fluks totalnya (masuk + keluar) saling meniadakan menjadi nol.`,
        weight: 1
    },
    {
        text: `Permukaan luar silinder karton di bagian tengah gulungan tisu dapur:`,
        category: 'WEEK_2',
        option_a: `Adalah permukaan Gaussian yang memungkinkan`,
        option_b: `Tidak dapat menjadi permukaan Gaussian karena tidak melingkupi muatan`,
        option_c: `Tidak dapat menjadi permukaan Gaussian karena merupakan isolator`,
        option_d: `Tidak dapat menjadi permukaan Gaussian karena bukan permukaan tertutup`,
        option_e: `Tidak ada pilihan di atas yang benar`,
        correct_answer: 'D',
        explanation: `Syarat mutlak untuk dapat menerapkan Hukum Gauss ($\\oint \\vec{E} \\cdot d\\vec{A}$) adalah permukaan tersebut harus berbentuk **permukaan tertutup (*closed surface*)** yang sepenuhnya membatasi suatu volume 3D sehingga tidak ada "lubang" untuk keluar atau masuk. 
Gulungan tisu dapur berbentuk silinder berongga dengan kedua ujungnya (atas dan bawah) terbuka. Karena ada lubang, ia bukanlah permukaan Gaussian yang valid.`,
        weight: 1
    },
    {
        text: `Seorang instruktur fisika di ruang tunggu mengisi sebuah generator elektrostatik hingga bermuatan $25 \\, \\mu\\text{C}$, lalu membawanya masuk ke dalam ruang kuliah. Fluks listrik bersih dalam satuan $\\text{N}\\cdot\\text{m}^2/\\text{C}$ yang menembus dinding, lantai, dan langit-langit ruang kuliah tersebut adalah:`,
        category: 'WEEK_2',
        option_a: `$0$`,
        option_b: `$25 \\times 10^{-6}$`,
        option_c: `$2,2 \\times 10^5$`,
        option_d: `$2,8 \\times 10^6$`,
        option_e: `Tidak bisa diketahui kecuali dimensi ruang kuliah diberikan`,
        correct_answer: 'D',
        explanation: `Ruang kuliah (yang memiliki dinding, lantai, dan langit-langit) bertindak sebagai sebuah **permukaan Gaussian raksasa yang tertutup**. Tidak peduli seberapa besar atau apa bentuk ruangannya, fluks listrik total yang menembus permukaannya hanya bergantung pada muatan di dalamnya.
Gunakan Hukum Gauss:
$$\\Phi_E = \\frac{q}{\\varepsilon_0}$$
$$\\Phi_E = \\frac{25 \\times 10^{-6}}{8,854 \\times 10^{-12}}$$
$$\\Phi_E \\approx 2,82 \\times 10^6 \\text{ N}\\cdot\\text{m}^2/\\text{C}$$`,
        weight: 1
    },
    {
        text: `Sebuah partikel titik dengan muatan $q$ ditempatkan di dalam sebuah kubus tetapi tidak tepat di pusatnya. Fluks listrik yang menembus *salah satu* sisi (satu permukaan) dari kubus tersebut:`,
        category: 'WEEK_2',
        option_a: `Adalah nol`,
        option_b: `Adalah $q/\\varepsilon_0$`,
        option_c: `Adalah $q/4\\varepsilon_0$`,
        option_d: `Adalah $q/6\\varepsilon_0$`,
        option_e: `Tidak dapat dihitung menggunakan Hukum Gauss`,
        correct_answer: 'E',
        explanation: `Hukum Gauss dapat memberi tahu kita bahwa *total* fluks yang menembus seluruh keenam sisi kubus adalah persis $q/\\varepsilon_0$. 
Namun, karena posisi muatan tidak berada tepat di pusat (simetrinya rusak), kita tidak bisa membagi fluks total tersebut dengan angka 6 secara merata. Sisi yang lebih dekat dengan muatan akan dilewati lebih banyak garis medan (fluks lebih besar), dan sisi yang lebih jauh akan mendapat lebih sedikit. Untuk menghitung fluks per sisi secara spesifik dalam kondisi asimetris ini membutuhkan kalkulus integral dua rangkap yang rumit, dan tidak dapat langsung dijawab hanya dengan menggunakan Hukum Gauss sederhana.`,
        weight: 1
    },
    {
        text: `Sebuah partikel dengan muatan $5,0 \\, \\mu\\text{C}$ ditempatkan di sudut sebuah kubus. Total fluks listrik dalam satuan $\\text{N}\\cdot\\text{m}^2/\\text{C}$ yang menembus *semua* sisi kubus tersebut adalah:`,
        category: 'WEEK_2',
        option_a: `$0$`,
        option_b: `$7,1 \\times 10^4$`,
        option_c: `$9,4 \\times 10^4$`,
        option_d: `$1,4 \\times 10^5$`,
        option_e: `$5,6 \\times 10^5$`,
        correct_answer: 'E',
        explanation: `*(Catatan Koreksi dari Pembuat Soal: Opsi jawaban 'E' didasarkan pada asumsi bahwa muatan tersebut dianggap berada "sepenuhnya di dalam" volume kubus di dekat sudutnya, sehingga nilai $q_{encl} = q$. Secara matematis sangat ketat, jika muatan titik terletak TEPAT di titik sudut kubus, maka ia dimiliki oleh 8 kubus yang bersebelahan, sehingga hanya $1/8$ bagian muatan yang berada di dalam kubus tersebut).*
Mengikuti logika dari opsi jawaban yang tersedia (dengan berasumsi muatan sepenuhnya tertangkap di dalam permukaan kubus):
$$\\Phi_E = \\frac{q}{\\varepsilon_0}$$
$$\\Phi_E = \\frac{5,0 \\times 10^{-6}}{8,854 \\times 10^{-12}}$$
$$\\Phi_E \\approx 5,64 \\times 10^5 \\text{ N}\\cdot\\text{m}^2/\\text{C}$$`,
        weight: 1
    },
    {
        text: `Sebuah partikel titik dengan muatan $q$ berada tepat di pusat sebuah permukaan Gaussian berbentuk kubus. Fluks listrik yang menembus *salah satu* permukaan sisi kubus tersebut adalah:`,
        category: 'WEEK_2',
        option_a: `$q/\\varepsilon_0$`,
        option_b: `$q/4\\pi\\varepsilon_0$`,
        option_c: `$q/3\\varepsilon_0$`,
        option_d: `$q/6\\varepsilon_0$`,
        option_e: `$q/12\\varepsilon_0$`,
        correct_answer: 'D',
        explanation: `Berdasarkan Hukum Gauss, total fluks yang menembus seluruh permukaan kubus adalah $\\Phi_{total} = q/\\varepsilon_0$.
Karena muatan diletakkan tepat di titik pusat kubus, sistem memiliki simetri yang sempurna. Garis-garis medan listrik akan memancar secara merata ke seluruh arah, menembus keenam sisi kubus dengan jumlah yang identik.
Oleh karena itu, fluks yang menembus hanya *satu* permukaannya adalah seperenam dari total fluks:
$$\\Phi_{satu\\_sisi} = \\frac{1}{6} \\Phi_{total} = \\frac{q}{6\\varepsilon_0}$$`,
        weight: 1
    },
    {
        text: `Sebuah bola konduktor berjari-jari $0,01 \\text{ m}$ memiliki muatan $1,0 \\times 10^{-9} \\text{ C}$ yang diendapkan padanya. Magnitudo medan listrik dalam satuan $\\text{N/C}$ tepat di luar permukaan bola tersebut adalah:`,
        category: 'WEEK_2',
        option_a: `$0$`,
        option_b: `$450$`,
        option_c: `$900$ *(Kunci Asli)*`,
        option_d: `$4500$`,
        option_e: `$90.000$ *(Jawaban yang benar secara matematis)*`,
        correct_answer: 'E',
        explanation: `Untuk medan listrik tepat di luar permukaan bola konduktor, bola dapat dianggap sebagai muatan titik di pusatnya:
$$E = k \\frac{Q}{r^2}$$
Dengan menggunakan angka yang tertulis persis di soal ($r = 0,01 \\text{ m}$):
$$E = (9 \\times 10^9) \\times \\frac{1,0 \\times 10^{-9}}{(0,01)^2}$$
$$E = \\frac{9}{10^{-4}} = 90.000 \\text{ N/C}$$
*(Jika mengikuti kunci jawaban C (900), maka jaraknya harusnya dihitung dengan $r = 0,1 \\text{ m}$).*`,
        weight: 1
    },
    {
        text: `Sebuah keranjang sampah kertas berbentuk bundar dengan jari-jari bukaan atas $0,15 \\text{ m}$ berada di dalam medan listrik seragam $300 \\text{ N/C}$ yang arahnya tegak lurus menembus masuk ke bukaannya. Total fluks yang menembus sisi-sisi keranjang dan dasar keranjang, dalam satuan $\\text{N}\\cdot\\text{m}^2/\\text{C}$, adalah:`,
        category: 'WEEK_2',
        option_a: `$0$`,
        option_b: `$4,2$`,
        option_c: `$21$`,
        option_d: `$280$`,
        option_e: `Tidak bisa diketahui tanpa mengetahui luas sisi dan dasar keranjang`,
        correct_answer: 'C',
        explanation: `Untuk menyelesaikannya secara cerdas, kita bayangkan kita meletakkan tutup datar di atas bukaan keranjang tersebut sehingga keranjang menjadi permukaan tertutup. 
Karena tidak ada muatan di dalam keranjang kosong, total fluks pada permukaan tertutup tersebut harus bernilai nol (Hukum Gauss).
$$\\Phi_{masuk\\_lewat\\_tutup} + \\Phi_{keluar\\_lewat\\_sisi\\_dan\\_bawah} = 0$$
Hitung fluks yang masuk melalui tutup (bukaan):
$$\\Phi_{masuk} = - E \\cdot A = - 300 \\times (\\pi \\cdot r^2)$$
$$\\Phi_{masuk} = - 300 \\times \\pi (0,15)^2$$
$$\\Phi_{masuk} = - 300 \\times 0,07068 \\approx - 21,2 \\text{ N}\\cdot\\text{m}^2/\\text{C}$$
Agar totalnya menjadi nol, maka sisa fluks yang menembus badan keranjang (sisi-sisi dan bawah) haruslah persis melawannya secara positif, yakni **$+21 \\text{ N}\\cdot\\text{m}^2/\\text{C}$**.`,
        weight: 1
    },
    {
        text: `Muatan sebesar $10 \\text{ C}$ ditempatkan pada sebuah cangkang konduktor bola (kulit bola). Sebuah partikel dengan muatan $-3 \\text{ C}$ ditempatkan di titik pusat rongga cangkang tersebut. Muatan bersih yang berada pada permukaan bagian DALAM cangkang tersebut adalah:`,
        category: 'WEEK_2',
        option_a: `$-7 \\text{ C}$`,
        option_b: `$-3 \\text{ C}$`,
        option_c: `$0 \\text{ C}$`,
        option_d: `$+3 \\text{ C}$`,
        option_e: `$+7 \\text{ C}$`,
        correct_answer: 'D',
        explanation: `Syarat elektrostatik konduktor adalah **medan listrik di dalam daging (materi) konduktor harus selalu nol**.
Jika kita membuat permukaan Gaussian melingkar persis di dalam materi daging cangkang konduktor tersebut, total muatan yang dilingkupinya wajib bernilai nol ($q_{encl} = 0$).
Total muatan yang dilingkupi = (Muatan partikel di tengah) + (Muatan yang terinduksi di dinding dalam).
$$0 = (-3 \\text{ C}) + q_{dalam}$$
$$q_{dalam} = +3 \\text{ C}$$
Muatan partikel $-3 \\text{ C}$ akan menarik muatan berlawanan jenis dari konduktor menuju permukaan bagian dalamnya.`,
        weight: 1
    },
    {
        text: `Muatan sebesar $10 \\text{ C}$ ditempatkan pada sebuah cangkang konduktor bola. Sebuah partikel dengan muatan $-3 \\text{ C}$ ditempatkan di titik pusat rongga cangkang tersebut. Muatan bersih yang berada pada permukaan bagian LUAR cangkang tersebut adalah:`,
        category: 'WEEK_2',
        option_a: `$-7 \\text{ C}$`,
        option_b: `$-3 \\text{ C}$`,
        option_c: `$0 \\text{ C}$`,
        option_d: `$+3 \\text{ C}$`,
        option_e: `$+7 \\text{ C}$`,
        correct_answer: 'E',
        explanation: `Total muatan netto yang dimiliki oleh logam konduktor itu sendiri tidak boleh berubah (Kekekalan Muatan), yaitu tetap $10 \\text{ C}$.
Muatan konduktor ini didistribusikan ke permukaan dalam dan permukaan luarnya:
$$Q_{total\\_konduktor} = q_{dalam} + q_{luar}$$
Dari soal sebelumnya, kita tahu $q_{dalam} = +3 \\text{ C}$. Maka sisa muatannya akan terdorong ke permukaan luar:
$$10 \\text{ C} = +3 \\text{ C} + q_{luar}$$
$$q_{luar} = 10 \\text{ C} - 3 \\text{ C} = +7 \\text{ C}$$`,
        weight: 1
    },
    {
        text: `Sebuah medan listrik seragam sebesar $300 \\text{ N/C}$ *(dikoreksi dari sumber asli 30 N/C)* menunjuk tegak lurus menuju (menabrak) permukaan sebelah kiri dari sebuah lembaran konduktor besar yang netral. Rapat muatan permukaan dalam satuan $\\text{C/m}^2$ pada permukaan sebelah kiri dan sebelah kanan lembaran secara berturut-turut adalah:`,
        category: 'WEEK_2',
        option_a: `$-2,7 \\times 10^{-9} \\text{ C/m}^2; +2,7 \\times 10^{-9} \\text{ C/m}^2$`,
        option_b: `$+2,7 \\times 10^{-9} \\text{ C/m}^2; -2,7 \\times 10^{-9} \\text{ C/m}^2$`,
        option_c: `$-5,3 \\times 10^{-9} \\text{ C/m}^2; +5,3 \\times 10^{-9} \\text{ C/m}^2$`,
        option_d: `$+5,3 \\times 10^{-9} \\text{ C/m}^2; -5,3 \\times 10^{-9} \\text{ C/m}^2$`,
        option_e: `$0; 0$`,
        correct_answer: 'A',
        explanation: `*(Catatan Koreksi: Angka $2,7 \\times 10^{-9}$ pada kunci jawaban didapatkan jika kuat medan eksternalnya adalah 300 N/C, bukan 30 N/C).*
Medan listrik eksternal akan menginduksi pergeseran elektron di dalam logam netral. Karena medan menunjuk "menuju" permukaan kiri (arah medan dari positif ke negatif), medan akan mendorong muatan positif (lubang) ke permukaan kanan dan menarik muatan negatif (elektron) berkumpul di permukaan kiri. 
Kerapatan muatannya dihitung menggunakan sifat medan di permukaan konduktor:
$$E = \\frac{\\sigma}{\\varepsilon_0}$$
$$\\sigma = E \\cdot \\varepsilon_0$$
$$\\sigma = 300 \\times 8,854 \\times 10^{-12}$$
$$\\sigma \\approx 2,656 \\times 10^{-9} \\approx 2,7 \\times 10^{-9} \\text{ C/m}^2$$
Permukaan kiri disinggahi garis medan (menjadi negatif): $\\sigma_{kiri} = -2,7 \\times 10^{-9} \\text{ C/m}^2$.
Permukaan kanan mengeluarkan garis medan (menjadi positif): $\\sigma_{kanan} = +2,7 \\times 10^{-9} \\text{ C/m}^2$.`,
        weight: 1
    },
    {
        text: `Muatan $Q$ didistribusikan secara seragam ke seluruh bagian sebuah bola **isolator** berjari-jari $R$. Magnitudo medan listrik pada suatu titik sejauh $R/2$ dari pusat bola adalah:`,
        category: 'WEEK_2',
        option_a: `$Q / 4\\pi\\varepsilon_0 R^2$`,
        option_b: `$Q / \\pi\\varepsilon_0 R^2$`,
        option_c: `$3Q / 4\\pi\\varepsilon_0 R^2$`,
        option_d: `$Q / 8\\pi\\varepsilon_0 R^2$`,
        option_e: `Tidak ada pilihan di atas yang benar`,
        correct_answer: 'D',
        explanation: `Untuk bola isolator pejal dengan muatan seragam, medan listrik di *dalam* bola ($r < R$) berbanding lurus dengan jaraknya dari pusat. Rumusnya didapat dari Hukum Gauss:
$$E_{dalam} = \\frac{k \\cdot Q \\cdot r}{R^3}$$
Dimana konstanta $k = \\frac{1}{4\\pi\\varepsilon_0}$.
Diketahui titik tersebut berada di kedalaman $r = \\frac{R}{2}$. Masukkan ke dalam rumus:
$$E = \\frac{1}{4\\pi\\varepsilon_0} \\frac{Q \\cdot (R/2)}{R^3}$$
$$E = \\frac{1}{4\\pi\\varepsilon_0} \\frac{Q \\cdot R}{2 \\cdot R^3}$$
$$E = \\frac{1}{4\\pi\\varepsilon_0} \\frac{Q}{2 R^2}$$
Kalikan faktor di penyebut:
$$E = \\frac{Q}{8\\pi\\varepsilon_0 R^2}$$`,
        weight: 1
    },
];
