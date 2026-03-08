export const week3Questions = [
    {
        text: `Sebuah partikel dengan muatan $5,5 \\times 10^{-8} \\text{ C}$ berjarak $3,5 \\text{ cm}$ dari partikel lain yang bermuatan $-2,3 \\times 10^{-8} \\text{ C}$. Energi potensial sistem dua partikel ini, relatif terhadap energi potensial pada jarak tak terhingga, adalah:`,
        category: 'WEEK_3',
        option_a: `$3,2 \\times 10^{-4} \\text{ J}$`,
        option_b: `$-3,2 \\times 10^{-4} \\text{ J}$`,
        option_c: `$9,3 \\times 10^{-3} \\text{ J}$`,
        option_d: `$-9,3 \\times 10^{-3} \\text{ J}$`,
        option_e: `Nol`,
        correct_answer: 'B',
        explanation: `Energi potensial listrik ($U$) antara dua muatan titik dirumuskan dengan:
$$U = k \\frac{q_1 q_2}{r}$$
Diketahui:
* $k = 8,99 \\times 10^9 \\text{ N}\\cdot\\text{m}^2/\\text{C}^2 \\approx 9 \\times 10^9$
* $q_1 = 5,5 \\times 10^{-8} \\text{ C}$
* $q_2 = -2,3 \\times 10^{-8} \\text{ C}$
* $r = 3,5 \\text{ cm} = 0,035 \\text{ m}$
Masukkan nilainya ke dalam rumus:
$$U = (9 \\times 10^9) \\frac{(5,5 \\times 10^{-8})(-2,3 \\times 10^{-8})}{0,035}$$
$$U = (9 \\times 10^9) \\frac{-12,65 \\times 10^{-16}}{0,035}$$
$$U = \\frac{-1,1385 \\times 10^{-5}}{0,035}$$
$$U \\approx -3,25 \\times 10^{-4} \\text{ J}$$
Nilai yang paling mendekati adalah **$-3,2 \\times 10^{-4} \\text{ J}$**.`,
        weight: 1
    },
    {
        text: `Sebuah partikel dengan muatan $5,5 \\times 10^{-8} \\text{ C}$ ditahan tetap di titik asal (pusat koordinat). Sebuah partikel kedua dengan muatan $-2,3 \\times 10^{-8} \\text{ C}$ dipindahkan dari $x = 3,5 \\text{ cm}$ di sumbu x ke $y = 4,3 \\text{ cm}$ di sumbu y. Perubahan energi potensial sistem dua partikel tersebut adalah:`,
        category: 'WEEK_3',
        option_a: `$3,1 \\times 10^{-3} \\text{ J}$`,
        option_b: `$-3,1 \\times 10^{-3} \\text{ J}$`,
        option_c: `$6,0 \\times 10^{-5} \\text{ J}$`,
        option_d: `$-6,0 \\times 10^{-5} \\text{ J}$`,
        option_e: `$0$`,
        correct_answer: 'C',
        explanation: `Perubahan energi potensial ($\\Delta U$) adalah energi potensial akhir dikurangi energi potensial awal ($\\Delta U = U_f - U_i$).
$$U_i = k \\frac{q_1 q_2}{r_i} \\quad \\text{dan} \\quad U_f = k \\frac{q_1 q_2}{r_f}$$
$$\\Delta U = k \\cdot q_1 \\cdot q_2 \\left( \\frac{1}{r_f} - \\frac{1}{r_i} \\right)$$
Diketahui jarak awal dan akhir dari titik asal:
* $r_i = 3,5 \\text{ cm} = 0,035 \\text{ m}$
* $r_f = 4,3 \\text{ cm} = 0,043 \\text{ m}$
Hitung konstantanya terlebih dahulu:
$$k \\cdot q_1 \\cdot q_2 = (8,99 \\times 10^9)(5,5 \\times 10^{-8})(-2,3 \\times 10^{-8}) \\approx -1,137 \\times 10^{-5} \\text{ J}\\cdot\\text{m}$$
Hitung selisih jarak terbaliknya:
$$\\frac{1}{0,043} - \\frac{1}{0,035} \\approx 23,25 - 28,57 = -5,32 \\text{ m}^{-1}$$
Kalikan keduanya:
$$\\Delta U = (-1,137 \\times 10^{-5}) \\times (-5,32) \\approx 6,05 \\times 10^{-5} \\text{ J}$$`,
        weight: 1
    },
    {
        text: `Sebuah partikel dengan muatan $5,5 \\times 10^{-8} \\text{ C}$ ditahan tetap di titik asal. Sebuah partikel kedua dengan muatan $-2,3 \\times 10^{-8} \\text{ C}$ dipindahkan dari $x = 3,5 \\text{ cm}$ di sumbu x ke $y = 3,5 \\text{ cm}$ di sumbu y. Perubahan energi potensial sistem dua partikel tersebut adalah:`,
        category: 'WEEK_3',
        option_a: `$3,2 \\times 10^{-4} \\text{ J}$`,
        option_b: `$-3,2 \\times 10^{-4} \\text{ J}$`,
        option_c: `$9,3 \\times 10^{-3} \\text{ J}$`,
        option_d: `$-9,3 \\times 10^{-3} \\text{ J}$`,
        option_e: `$0$`,
        correct_answer: 'E',
        explanation: `Seperti pada rumus sebelumnya, $\\Delta U = k \\cdot q_1 \\cdot q_2 \\left( \\frac{1}{r_f} - \\frac{1}{r_i} \\right)$.
Karena partikel dipindahkan dari jarak radial $r_i = 3,5 \\text{ cm}$ ke jarak radial yang sama persis $r_f = 3,5 \\text{ cm}$ (hanya berpindah kuadran dalam lintasan melingkar ekuipotensial), maka nilai $\\frac{1}{r_f} - \\frac{1}{r_i} = 0$. 
Karena tidak ada perubahan jarak relatif antara kedua partikel, maka **tidak ada perubahan energi potensial** ($\\Delta U = 0$).`,
        weight: 1
    },
    {
        text: `Tiga buah partikel terletak pada sumbu x: partikel 1 dengan muatan $1 \\times 10^{-8} \\text{ C}$ berada di $x = 1 \\text{ cm}$, partikel 2 dengan muatan $2 \\times 10^{-8} \\text{ C}$ berada di $x = 2 \\text{ cm}$, dan partikel 3 dengan muatan $-3 \\times 10^{-8} \\text{ C}$ berada di $x = 3 \\text{ cm}$. Energi potensial susunan ini, relatif terhadap energi potensial untuk jarak tak terhingga, adalah:`,
        category: 'WEEK_3',
        option_a: `$+4,9 \\times 10^{-4} \\text{ J}$`,
        option_b: `$-4,9 \\times 10^{-4} \\text{ J}$`,
        option_c: `$+8,5 \\times 10^{-4} \\text{ J}$`,
        option_d: `$-8,5 \\times 10^{-4} \\text{ J}$`,
        option_e: `Nol`,
        correct_answer: 'B',
        explanation: `Energi potensial total sistem multi-partikel adalah jumlah skalar dari energi potensial masing-masing pasangan partikel:
$$U_{tot} = U_{12} + U_{13} + U_{23}$$
$$U_{tot} = k \\left( \\frac{q_1 q_2}{r_{12}} + \\frac{q_1 q_3}{r_{13}} + \\frac{q_2 q_3}{r_{23}} \\right)$$
Jarak antar partikel:
* $r_{12} = 1 \\text{ cm} = 0,01 \\text{ m}$
* $r_{13} = 2 \\text{ cm} = 0,02 \\text{ m}$
* $r_{23} = 1 \\text{ cm} = 0,01 \\text{ m}$
Tarik keluar faktor pengali $10^{-8} \\times 10^{-8} = 10^{-16}$:
$$U_{tot} = (9 \\times 10^9)(10^{-16}) \\left( \\frac{(1)(2)}{0,01} + \\frac{(1)(-3)}{0,02} + \\frac{(2)(-3)}{0,01} \\right)$$
$$U_{tot} = (9 \\times 10^{-7}) \\left( 200 - 150 - 600 \\right)$$
$$U_{tot} = (9 \\times 10^{-7}) \\times (-550)$$
$$U_{tot} = -4950 \\times 10^{-7} = -4,95 \\times 10^{-4} \\text{ J}$$
Maka nilai yang paling mendekati adalah **$-4,9 \\times 10^{-4} \\text{ J}$**.`,
        weight: 1
    },
    {
        text: `Dua buah partikel identik, masing-masing dengan muatan $q$, ditempatkan pada sumbu x, satu di titik asal ($x=0$) dan yang lainnya di $x = 5 \\text{ cm}$. Partikel ketiga, dengan muatan $-q$, ditempatkan pada sumbu x sedemikian rupa sehingga energi potensial sistem tiga partikel tersebut sama dengan energi potensial pada jarak tak terhingga (yakni nol). Koordinat letak partikel ketiga ($x$) tersebut adalah:`,
        category: 'WEEK_3',
        option_a: `$13 \\text{ cm}$`,
        option_b: `$2,5 \\text{ cm}$`,
        option_c: `$7,5 \\text{ cm}$`,
        option_d: `$10 \\text{ cm}$`,
        option_e: `$-5 \\text{ cm}$`,
        correct_answer: 'A',
        explanation: `Total energi potensial sistem 3 partikel dirumuskan sama dengan nol ($U_{tot} = 0$). Misalkan jarak antar dua muatan awal adalah $d = 5 \\text{ cm}$.
$$U_{tot} = k \\left( \\frac{q \\cdot q}{d} + \\frac{q \\cdot (-q)}{x} + \\frac{q \\cdot (-q)}{x-d} \\right) = 0$$
Keluarkan konstanta $k \\cdot q^2$ dan bagi dengan 0:
$$\\frac{1}{d} - \\frac{1}{x} - \\frac{1}{x-d} = 0$$
$$\\frac{1}{5} = \\frac{1}{x} + \\frac{1}{x-5}$$
$$\\frac{1}{5} = \\frac{(x-5) + x}{x(x-5)}$$
$$\\frac{1}{5} = \\frac{2x - 5}{x^2 - 5x}$$
$$x^2 - 5x = 10x - 25$$
$$x^2 - 15x + 25 = 0$$
Gunakan rumus kuadrat (abc) untuk mencari x:
$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$
$$x = \\frac{15 \\pm \\sqrt{(-15)^2 - 4(1)(25)}}{2}$$
$$x = \\frac{15 \\pm \\sqrt{225 - 100}}{2} = \\frac{15 \\pm \\sqrt{125}}{2}$$
$$x = \\frac{15 \\pm 11,18}{2}$$
Jika kita ambil nilai positifnya:
$$x \\approx \\frac{26,18}{2} = 13,09 \\text{ cm} \\approx 13 \\text{ cm}$$`,
        weight: 1
    },
    {
        text: `Pilih pernyataan yang benar:`,
        category: 'WEEK_3',
        option_a: `Sebuah proton cenderung berpindah dari daerah berpotensial rendah ke daerah berpotensial tinggi`,
        option_b: `Potensial listrik dari sebuah konduktor bermuatan negatif haruslah bernilai negatif`,
        option_c: `Jika $\\vec{E} = 0$ pada sebuah titik P, maka $V$ pasti bernilai nol di titik P`,
        option_d: `Jika $V = 0$ pada sebuah titik P, maka $\\vec{E}$ pasti bernilai nol di titik P`,
        option_e: `Tidak ada pernyataan di atas yang benar`,
        correct_answer: 'E',
        explanation: `Mari kita analisis setiap opsi:
* **A salah**: Proton bermuatan positif, secara alami akan bergerak searah dengan medan listrik, yakni menuju ke potensial yang **lebih rendah**, bukan lebih tinggi.
* **B salah**: Nilai potensial listrik ($V$) bersifat relatif terhadap titik referensi. Konduktor bermuatan negatif bisa saja memiliki potensial positif jika referensi nol-nya ($V=0$) diatur jauh lebih negatif di tempat lain.
* **C salah**: Hubungan medan dan potensial adalah $\\vec{E} = -\\frac{dV}{dx}$. Jika $\\vec{E}=0$, itu hanya berarti tegangan $V$ adalah **konstan**, bukan berarti harus nol (contoh: di dalam bola konduktor).
* **D salah**: Jika $V=0$ (potensial bernilai nol di suatu titik acuan transisi silang), nilai gradien tegangannya ($\\vec{E}$) belum tentu nol. (Contoh: tepat di titik tengah antara dipol muatan positif dan negatif, potensialnya nol tapi medannya sangat kuat).
Oleh karena itu, semua pernyataan salah.`,
        weight: 1
    },
    {
        text: `Jika usaha sebesar $500 \\text{ J}$ diperlukan untuk membawa sebuah partikel bermuatan di antara dua titik dengan beda potensial $20 \\text{ V}$, magnitudo muatan pada partikel tersebut adalah:`,
        category: 'WEEK_3',
        option_a: `$0,040 \\text{ C}$`,
        option_b: `$12,5 \\text{ C}$ *(Kunci Asli)*`,
        option_c: `$20 \\text{ C}$`,
        option_d: `Tidak dapat dihitung kecuali lintasannya diberikan`,
        option_e: `$25 \\text{ C}$ *(Jawaban yang benar secara matematis)*`,
        correct_answer: 'E',
        explanation: `Usaha ($W$) yang dilakukan untuk memindahkan muatan ($q$) melintasi beda potensial ($V$) hanya bergantung pada titik awal dan akhir, dan tidak bergantung pada lintasan (medan konservatif). Rumusnya adalah:
$$W = q \\cdot \\Delta V$$
Susun ulang untuk mencari muatan ($q$):
$$q = \\frac{W}{\\Delta V}$$
$$q = \\frac{500 \\text{ J}}{20 \\text{ V}} = 25 \\text{ C}$$
*(Catatan untuk mahasiswa: Kunci B ($12,5 \\text{ C}$) hanya bisa didapat jika usahanya adalah $250 \\text{ J}$, yang mana kemungkinan besar merupakan kesalahan ketik pada soal sumber).*`,
        weight: 1
    },
    {
        text: `Beda potensial antara dua titik adalah $100 \\text{ V}$. Jika sebuah partikel dengan muatan $2 \\text{ C}$ ditransportasikan dari salah satu titik ke titik lainnya, besar usaha yang dilakukan adalah:`,
        category: 'WEEK_3',
        option_a: `$200 \\text{ J}$`,
        option_b: `$100 \\text{ J}$`,
        option_c: `$50 \\text{ J}$`,
        option_d: `$-100 \\text{ J}$ *(Di opsi asli tertulis 100J dua kali)*`,
        option_e: `$2 \\text{ J}$`,
        correct_answer: 'A',
        explanation: `Gunakan rumus usaha listrik:
$$W = q \\cdot \\Delta V$$
$$W = 2 \\text{ C} \\times 100 \\text{ V}$$
$$W = 200 \\text{ J}$$`,
        weight: 1
    },
    {
        text: `Selama pelepasan muatan petir, muatan sebesar $30 \\text{ C}$ bergerak melintasi beda potensial sebesar $1,0 \\times 10^8 \\text{ V}$ dalam waktu $2,0 \\times 10^{-2} \\text{ s}$. Energi yang dilepaskan oleh sambaran petir ini adalah:`,
        category: 'WEEK_3',
        option_a: `$1,5 \\times 10^{11} \\text{ J}$`,
        option_b: `$3,0 \\times 10^9 \\text{ J}$`,
        option_c: `$6,0 \\times 10^7 \\text{ J}$`,
        option_d: `$3,3 \\times 10^6 \\text{ J}$`,
        option_e: `$1500 \\text{ J}$`,
        correct_answer: 'B',
        explanation: `Energi ($E$) yang dilepaskan sama dengan besarnya usaha listrik yang dilakukan. Variabel waktu yang diberikan di dalam soal hanyalah informasi tambahan pengecoh dan tidak digunakan untuk menghitung energi total.
$$E = q \\cdot \\Delta V$$
$$E = (30 \\text{ C}) \\times (1,0 \\times 10^8 \\text{ V})$$
$$E = 30 \\times 10^8 \\text{ J} = 3,0 \\times 10^9 \\text{ J}$$`,
        weight: 1
    },
    {
        text: `Sebuah elektron dipercepat dari keadaan diam melalui beda potensial $V$. Kelajuan akhirnya sebanding dengan:`,
        category: 'WEEK_3',
        option_a: `$V$`,
        option_b: `$V^2$`,
        option_c: `$\\sqrt{V}$`,
        option_d: `$1/V$`,
        option_e: `$1/\\sqrt{V}$`,
        correct_answer: 'C',
        explanation: `Berdasarkan asas kekekalan energi, energi potensial listrik yang hilang saat melintasi beda potensial sepenuhnya diubah menjadi energi kinetik elektron.
$$\\Delta EP = \\Delta EK$$
$$q \\cdot V = \\frac{1}{2} m v^2$$
Susun ulang persamaan untuk mencari kelajuan ($v$):
$$v^2 = \\frac{2 \\cdot q \\cdot V}{m}$$
$$v = \\sqrt{\\frac{2 \\cdot q \\cdot V}{m}}$$
Dari persamaan di atas, dapat dilihat bahwa kelajuan akhir $v$ berbanding lurus (proporsional) terhadap akar kuadrat dari beda potensial ($\\sqrt{V}$).`,
        weight: 1
    },
    {
        text: `Satuan dari kapasitansi ekuivalen (setara) dengan:`,
        category: 'WEEK_3',
        option_a: `$\\text{J/C}$`,
        option_b: `$\\text{V/C}$`,
        option_c: `$\\text{J}^2\\text{/C}$`,
        option_d: `$\\text{C/J}$`,
        option_e: `$\\text{C}^2\\text{/J}$`,
        correct_answer: 'E',
        explanation: `Satuan kapasitansi ($C$) didefinisikan sebagai muatan ($Q$) dibagi dengan tegangan ($V$):
$$C = \\frac{Q}{V}$$
Secara satuan: $\\text{Farad} = \\frac{\\text{Coulomb}}{\\text{Volt}} \\implies \\text{F} = \\frac{\\text{C}}{\\text{V}}$
Kita tahu bahwa Volt (Beda Potensial) adalah energi per muatan, sehingga $\\text{Volt} = \\text{Joule/Coulomb}$ ($\\text{V} = \\text{J/C}$).
Substitusikan definisi Volt tersebut ke persamaan pertama:
$$\\text{Farad} = \\frac{\\text{C}}{\\text{J/C}}$$
$$\\text{Farad} = \\text{C} \\times \\frac{\\text{C}}{\\text{J}}$$
$$\\text{Farad} = \\frac{\\text{C}^2}{\\text{J}}$$`,
        weight: 1
    },
    {
        text: `Satu farad sama dengan:`,
        category: 'WEEK_3',
        option_a: `$\\text{J/V}$`,
        option_b: `$\\text{V/J}$`,
        option_c: `$\\text{C/V}$`,
        option_d: `$\\text{V/C}$`,
        option_e: `$\\text{N/C}$`,
        correct_answer: 'C',
        explanation: `Berdasarkan definisi fundamental dari kapasitansi pada persamaan $C = \\frac{Q}{V}$, satu Farad (satuan $C$) secara harfiah adalah kemampuan menyimpan satu Coulomb (satuan $Q$) muatan per satu Volt (satuan $V$) beda potensial.
$$1 \\text{ Farad} = 1 \\text{ Coulomb / Volt} = 1 \\text{ C/V}$$`,
        weight: 1
    },
    {
        text: `Sebuah kapasitor C "memiliki muatan Q". Muatan yang sebenarnya berada pada pelat-pelatnya adalah:`,
        category: 'WEEK_3',
        option_a: `$Q, Q$`,
        option_b: `$Q/2, Q/2$`,
        option_c: `$Q, -Q$`,
        option_d: `$Q/2, -Q/2$`,
        option_e: `$Q, 0$`,
        correct_answer: 'C',
        explanation: `Sebuah kapasitor selalu terdiri dari sepasang pelat konduktor. Saat kapasitor dikatakan memiliki "muatan $Q$", itu berarti terjadi pemisahan muatan di mana salah satu pelat akan menimbun muatan positif sebesar $+Q$, dan pelat yang satu lagi akan menimbun muatan negatif yang persis sama besar yaitu $-Q$. Secara keseluruhan, muatan netto (total) kapasitor sebenarnya selalu nol.`,
        weight: 1
    },
    {
        text: `Setiap pelat kapasitor menyimpan muatan sebesar $1 \\text{ mC}$ ketika beda potensial $100 \\text{ V}$ diterapkan. Kapasitansinya adalah:`,
        category: 'WEEK_3',
        option_a: `$5 \\, \\mu\\text{F}$`,
        option_b: `$10 \\, \\mu\\text{F}$`,
        option_c: `$50 \\, \\mu\\text{F}$`,
        option_d: `$100 \\, \\mu\\text{F}$`,
        option_e: `Tidak ada pilihan di atas yang benar`,
        correct_answer: 'B',
        explanation: `Gunakan rumus kapasitansi:
$$C = \\frac{Q}{V}$$
Diketahui:
* Muatan pelat ($Q$) = $1 \\text{ mC} = 1 \\times 10^{-3} \\text{ C}$
* Tegangan ($V$) = $100 \\text{ V}$
Masukkan nilainya:
$$C = \\frac{1 \\times 10^{-3}}{100}$$
$$C = 1 \\times 10^{-5} \\text{ Farad}$$
Ubah ke dalam satuan mikroFarad ($\\mu\\text{F}$, yaitu dikali $10^6$):
$$C = (1 \\times 10^{-5}) \\times 10^6 \\, \\mu\\text{F} = 10 \\, \\mu\\text{F}$$`,
        weight: 1
    },
    {
        text: `Untuk mengisi kapasitor $1 \\text{ F}$ dengan muatan $2 \\text{ C}$, dibutuhkan beda potensial sebesar:`,
        category: 'WEEK_3',
        option_a: `$2 \\text{ V}$`,
        option_b: `$0,2 \\text{ V}$`,
        option_c: `$5 \\text{ V}$`,
        option_d: `$0,5 \\text{ V}$`,
        option_e: `Tidak ada pilihan di atas yang benar`,
        correct_answer: 'A',
        explanation: `Berdasarkan rumus relasi kapasitor:
$$C = \\frac{Q}{V} \\implies V = \\frac{Q}{C}$$
Masukkan nilainya:
$$V = \\frac{2 \\text{ C}}{1 \\text{ F}}$$
$$V = 2 \\text{ V}$$`,
        weight: 1
    },
    {
        text: `Kapasitansi dari sebuah kapasitor pelat sejajar dengan luas pelat $A$ dan jarak antar pelat $d$ dirumuskan oleh:`,
        category: 'WEEK_3',
        option_a: `$\\varepsilon_0 d / A$`,
        option_b: `$\\varepsilon_0 d / 2A$`,
        option_c: `$\\varepsilon_0 A / d$`,
        option_d: `$\\varepsilon_0 A / 2d$`,
        option_e: `$A d / \\varepsilon_0$`,
        correct_answer: 'C',
        explanation: `*(Catatan: Opsi pada sumber asli mengalami kerusakan format huruf, di mana simbol $\\varepsilon_0$ tercetak sebagai angka '0'. Ini adalah format yang telah diperbaiki).*
Rumus fundamental murni untuk kapasitansi ruang hampa pada kapasitor pelat keping sejajar selalu berbanding lurus dengan permitivitas ruang hampa ($\\varepsilon_0$) dikali luas penampang ($A$), dan berbanding terbalik dengan jarak pemisah kedua keping ($d$).
$$C = \\frac{\\varepsilon_0 \\cdot A}{d}$$`,
        weight: 1
    },
    {
        text: `Kapasitansi dari sebuah kapasitor pelat sejajar adalah:`,
        category: 'WEEK_3',
        option_a: `Sebanding (berbanding lurus) dengan luas pelat`,
        option_b: `Sebanding dengan muatan yang disimpan`,
        option_c: `Independen (tidak terpengaruh) dari material apa pun yang dimasukkan di antara pelat`,
        option_d: `Sebanding dengan beda potensial pelat-pelatnya`,
        option_e: `Sebanding dengan jarak antar pelat`,
        correct_answer: 'A',
        explanation: `Berdasarkan rumus geometri kapasitor pelat sejajar:
$$C = \\kappa \\frac{\\varepsilon_0 A}{d}$$
* Kapasitansi berbanding lurus dengan luas penampang keping ($A$). (Opsi A benar).
* Nilai $C$ ditentukan oleh geometri murni alatnya, bukan dari seberapa banyak muatan ($Q$) atau tegangan ($V$) yang diisikan nantinya (Opsi B dan D salah).
* Jika dimasukkan bahan dielektrik dengan konstanta $\\kappa$, maka nilai $C$ akan naik, sehingga ia sangat bergantung pada material di antara pelat (Opsi C salah).
* Kapasitansi berbanding terbalik dengan jarak $d$, bukan berbanding lurus (Opsi E salah).`,
        weight: 1
    },
    {
        text: `Luas pelat dan jarak antar pelat dari lima buah kapasitor pelat sejajar adalah sebagai berikut:
Kapasitor 1: luas $A_0$, jarak $d_0$
Kapasitor 2: luas $2A_0$, jarak $2d_0$
Kapasitor 3: luas $2A_0$, jarak $d_0/2$
Kapasitor 4: luas $A_0/2$, jarak $2d_0$
Kapasitor 5: luas $A_0$, jarak $d_0/2$
Urutkan kapasitor-kapasitor tersebut berdasarkan nilai kapasitansinya, dari yang terkecil hingga terbesar.`,
        category: 'WEEK_3',
        option_a: `1, 2, 3, 4, 5`,
        option_b: `5, 4, 3, 2, 1`,
        option_c: `5, seri (sama) 3 dan 4, lalu 1, 2`,
        option_d: `4, seri (sama) 1 dan 2, lalu 5, 3`,
        option_e: `3, 5, seri (sama) 1 dan 2, 1, 4`,
        correct_answer: 'D',
        explanation: `Gunakan rumus dasar proporsi kapasitansi $C \\propto \\frac{A}{d}$. Kita hitung koefisien perbandingannya untuk tiap kapasitor:
* $C_1 = \\frac{1}{1} = 1$
* $C_2 = \\frac{2}{2} = 1$
* $C_3 = \\frac{2}{1/2} = 4$
* $C_4 = \\frac{1/2}{2} = 0,25$
* $C_5 = \\frac{1}{1/2} = 2$
Urutan dari nilai yang terkecil hingga terbesar adalah:
$0,25 < 1 = 1 < 2 < 4$
Maka urutannya adalah **Kapasitor 4**, lalu **1 dan 2 bernilai sama (tie)**, lalu **5**, dan paling besar **3**.`,
        weight: 1
    },
    {
        text: `Kapasitansi dari kapasitor pelat sejajar dapat ditingkatkan dengan cara:`,
        category: 'WEEK_3',
        option_a: `Meningkatkan muatannya`,
        option_b: `Mengurangi muatannya`,
        option_c: `Meningkatkan jarak antar pelat`,
        option_d: `Mengurangi jarak antar pelat`,
        option_e: `Mengurangi luas pelat`,
        correct_answer: 'D',
        explanation: `Dari rumus $C = \\frac{\\varepsilon_0 A}{d}$, kita dapat menyimpulkan bahwa nilai kapasitansi ($C$) berbanding terbalik dengan jarak antar pelat ($d$). Artinya, semakin kecil pembaginya (jarak $d$ diperkecil/dikurangi), maka hasil baginya (Kapasitansi $C$) akan menjadi semakin besar.`,
        weight: 1
    },
    {
        text: `Jika luas pelat dan jarak pemisah antar pelat dari sebuah kapasitor pelat sejajar keduanya digandakan (dikali dua), maka kapasitansinya menjadi:`,
        category: 'WEEK_3',
        option_a: `Dua kali lipat`,
        option_b: `Setengahnya`,
        option_c: `Tidak berubah`,
        option_d: `Tiga kali lipat`,
        option_e: `Empat kali lipat`,
        correct_answer: 'C',
        explanation: `Kapasitansi awal:
$$C = \\frac{\\varepsilon_0 A}{d}$$
Jika Luas ($A$) menjadi $2A$ dan Jarak ($d$) menjadi $2d$, maka kapasitansi baru ($C'$) adalah:
$$C' = \\frac{\\varepsilon_0 (2A)}{2d}$$
Karena angka 2 di pembilang dan penyebut saling menghilangkan, maka:
$$C' = \\frac{\\varepsilon_0 A}{d} = C$$
Sehingga nilai kapasitansinya tetap atau **tidak berubah**.`,
        weight: 1
    },
];
