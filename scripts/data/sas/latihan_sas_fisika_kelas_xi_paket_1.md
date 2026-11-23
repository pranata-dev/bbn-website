# Latihan Soal dan Pembahasan SAS Fisika Kelas XI ICC — Paket 1

**Soal 1:**
Which of the following is an equivalent standard SI unit for impulse?

A. $\text{kg}\cdot\text{m/s}^{2}$
B. $\text{N}\cdot\text{m}$
C. $\text{N/s}$
D. $\text{kg}\cdot\text{m/s}$
E. $\text{J}\cdot\text{s}$

---
**Pembahasan:**

* **Prinsip Fisika:** Impuls ($J$) didefinisikan sebagai hasil kali gaya rata-rata ($F$) dengan selang waktu kerja gaya ($\Delta t$), dan menurut Teorema Impuls-Momentum nilainya sama dengan perubahan momentum linier ($\Delta p$).

* **Langkah Penyelesaian:**
  1. Tuliskan definisi impuls: $J = F \cdot \Delta t$, sehingga satuan SI dasarnya adalah $\text{N}\cdot\text{s}$ (newton-sekon).
  2. Uraikan satuan gaya newton ($\text{N}$) menggunakan Hukum II Newton ($F = m \cdot a$): $1\text{ N} = 1\text{ kg}\cdot\text{m/s}^{2}$.
  3. Substitusikan ke dalam satuan impuls:
     $$
     [J] = \text{N}\cdot\text{s} = (\text{kg}\cdot\text{m/s}^{2})\cdot\text{s} = \text{kg}\cdot\text{m/s}
     $$

* **Analisis Opsi:** A ($\text{kg}\cdot\text{m/s}^{2}$) adalah satuan gaya ($\text{N}$); B ($\text{N}\cdot\text{m}$) adalah satuan usaha/energi ($\text{J}$) atau torsi; C ($\text{N/s}$) adalah laju perubahan gaya; E ($\text{J}\cdot\text{s}$) adalah satuan momentum sudut atau konstanta Planck. Hanya D ($\text{kg}\cdot\text{m/s}$) yang setara dengan satuan impuls.

**Jawaban: D**

**Soal 2:**
An astronaut floating motionless in deep space throws a heavy wrench straight forward away from herself. As a result, the astronaut moves backward in the opposite direction because...

A. the kinetic energy of the astronaut and wrench system is conserved.
B. the total linear momentum of the astronaut and wrench system is conserved.
C. the astronaut exerts a smaller force on the wrench than the wrench exerts on her.
D. the kinetic energy of the astronaut must equal the kinetic energy of the wrench.
E. the forward force on the wrench is greater than the backward reaction force.

---
**Pembahasan:**

* **Analisis Sistem:** Di ruang angkasa dalam (*deep space*), tidak ada gaya eksternal signifikan yang bekerja pada sistem astronaut + kunci inggris ($\sum F_{\text{ext}} = 0$), sehingga sistem bersifat terisolasi.

* **Langkah Penyelesaian:**
  1. Keadaan awal diam bersama, maka momentum linier total awal bernilai nol: $p_{\text{awal}} = 0$.
  2. Karena sistem terisolasi, Hukum Kekekalan Momentum Linier berlaku: $p_{\text{akhir}} = p_{\text{awal}} = 0$.
  3. Setelah melempar kunci inggris ($m_{w}$) ke depan dengan kecepatan $+v_{w}$:
     $$
     m_{a}v_{a} + m_{w}v_{w} = 0 \implies v_{a} = -\frac{m_{w}}{m_{a}}v_{w}
     $$
     Tanda minus menunjukkan astronaut terdorong ke belakang (berlawanan arah lemparan) agar jumlah vektor momentum sistem tetap nol.

* **Analisis Opsi:** A salah karena energi kinetik sistem bertambah dari nol (berasal dari energi kimia otot astronaut); C dan E salah karena melanggar Hukum III Newton (gaya aksi-reaksi sama besar); D salah karena $K = p^{2}/(2m)$ sehingga dengan $\vert p \vert$ sama, benda bermassa lebih kecil (kunci inggris) memperoleh energi kinetik lebih besar.

**Jawaban: B**

**Soal 3:**
An open freight cart rolls freely along a straight, horizontal, frictionless track at a constant speed. A heavy sandbag slips off the side of the cart and drops straight down relative to the cart. What happens to the horizontal speed of the cart?

A. It remains the same.
B. It increases because the cart now has less mass.
C. It decreases because momentum is lost with the sandbag.
D. It immediately drops to zero.
E. It cannot be determined without knowing the mass of the sandbag.

---
**Pembahasan:**

* **Identifikasi Kunci:** Karung pasir terlepas dan jatuh lurus ke bawah relatif terhadap gerobak (*straight down relative to the cart*). Artinya, pada saat terlepas, komponen kecepatan horizontal karung pasir masih sama persis dengan kecepatan horizontal gerobak ($v_{x,\text{karung}} = v$).

* **Langkah Penyelesaian:**
  1. Tinjau momentum horizontal sistem (gerobak bermassa $m_{g}$ + karung pasir bermassa $m_{k}$) karena tidak ada gaya eksternal horizontal (lintasan tanpa gesekan).
  2. Momentum horizontal awal sebelum karung terlepas: $p_{x,\text{awal}} = (m_{g} + m_{k})v$.
  3. Sesaat setelah karung terlepas secara vertikal relatif terhadap gerobak, tidak ada impuls horizontal antara keduanya; karung tetap melaju ke depan dengan kecepatan horizontal $v$ sambil jatuh ke bawah akibat gravitasi.
  4. Terapkan kekekalan momentum horizontal untuk mencari kecepatan baru gerobak ($v_{g}'$):
     $$
     (m_{g} + m_{k})v = m_{g}v_{g}' + m_{k}v \implies m_{g}v = m_{g}v_{g}' \implies v_{g}' = v
     $$

* **Analisis Opsi:** B adalah miskonsepsi paling umum (mengira $(m_{g} + m_{k})v = m_{g}v_{g}'$, padahal karung pasir juga masih membawa momentum horizontal $m_{k}v$); C, D, dan E salah karena tidak ada gaya hambat horizontal.

**Jawaban: A**

**Soal 4:**
Two balls of equal mass, Ball X and Ball Y, are thrown horizontally at the exact same speed against a solid brick wall. Ball X rebounds straight back with nearly the same speed it had before impact, while Ball Y flattens and sticks to the wall. Which statement about the magnitude of the change in momentum ($\vert \Delta p \vert$) is correct?

A. Ball Y experiences a greater change in momentum than Ball X.
B. Both balls experience the exact same change in momentum.
C. Ball X experiences approximately twice the change in momentum of Ball Y.
D. Neither ball experiences a change in momentum because the wall remains stationary.
E. Ball X experiences zero change in momentum because its speed does not change.

---
**Pembahasan:**

* **Konvensi Arah:** Tetapkan arah menuju dinding sebagai positif ($+$) dan arah memantul menjauhi dinding sebagai negatif ($-$). Kedua bola memiliki massa sama ($m$) dan kecepatan awal sama ($v_{i} = +v$).

* **Langkah Penyelesaian:**
  1. Hitung perubahan momentum Bola X (memantul balik dengan kelajuan hampir sama, $v_{f,X} \approx -v$):
     $$
     \Delta p_{X} = m(v_{f,X} - v_{i}) \approx m(-v - v) = -2mv \implies \vert \Delta p_{X} \vert \approx 2mv
     $$
  2. Hitung perubahan momentum Bola Y (menempel dan berhenti di dinding, $v_{f,Y} = 0$):
     $$
     \Delta p_{Y} = m(v_{f,Y} - v_{i}) = m(0 - v) = -mv \implies \vert \Delta p_{Y} \vert = mv
     $$
  3. Bandingkan besar keduanya:
     $$
     \frac{\vert \Delta p_{X} \vert}{\vert \Delta p_{Y} \vert} \approx \frac{2mv}{mv} = 2
     $$

* **Analisis Opsi:** E salah karena menyamakan kelajuan skalar dengan kecepatan vektor (arah berbalik berarti kecepatan berubah sebesar $2v$); A, B, dan D keliru secara matematis.

**Jawaban: C**

**Soal 5:**
A drone of mass $m$ flies with kinetic energy $K$. Which expression correctly gives the magnitude of its linear momentum $p$ using only $m$ and $K$?

A. $2mK$
B. $\sqrt{2mK}$
C. $\sqrt{mK/2}$
D. $K/(2m)$
E. $mK^{2}/2$

---
**Pembahasan:**

* **Langkah Penyelesaian:**
  1. Tuliskan rumus energi kinetik translasi dan momentum linier: $K = \frac{1}{2}mv^{2}$ dan $p = mv$.
  2. Nyatakan kelajuan $v$ dari definisi momentum: $v = p/m$.
  3. Substitusikan $v$ ke dalam persamaan energi kinetik dan selesaikan untuk $p$:
     $$
     K = \frac{1}{2}m\left(\frac{p}{m}\right)^{2} = \frac{p^{2}}{2m} \implies p^{2} = 2mK \implies p = \sqrt{2mK}
     $$

* **Verifikasi Dimensi:** $\sqrt{\text{kg}\cdot(\text{kg}\cdot\text{m}^{2}\text{/s}^{2})} = \sqrt{\text{kg}^{2}\cdot\text{m}^{2}\text{/s}^{2}} = \text{kg}\cdot\text{m/s}$ (cocok dengan satuan momentum). Opsi A, C, D, dan E memiliki dimensi dan faktor numerik yang salah.

**Jawaban: B**

**Soal 6:**
A hockey puck is struck so that the magnitude of its linear momentum becomes three times larger than before while its mass stays constant. How does its new kinetic energy compare to its initial kinetic energy?

A. It is $1.5$ times as large.
B. It is $1.73$ times as large.
C. It is $3$ times as large.
D. It is $6$ times as large.
E. It is $9$ times as large.

---
**Pembahasan:**

* **Diketahui:** Massa tetap ($m_{2} = m_{1} = m$), momentum baru $p_{2} = 3p_{1}$.

* **Langkah Penyelesaian:**
  1. Gunakan hubungan $K = \frac{p^{2}}{2m}$ (dari Soal 5). Karena $m$ konstan, $K$ berbanding lurus dengan kuadrat momentum ($K \propto p^{2}$).
  2. Bandingkan energi kinetik baru ($K_{2}$) terhadap energi kinetik awal ($K_{1}$):
     $$
     \frac{K_{2}}{K_{1}} = \left(\frac{p_{2}}{p_{1}}\right)^{2} = \left(\frac{3p_{1}}{p_{1}}\right)^{2} = 3^{2} = 9 \implies K_{2} = 9K_{1}
     $$

* **Analisis Opsi:** C ($3$ kali) adalah jebakan linearitas bagi yang lupa kuadrat pada $p^{2}$; B ($1,73 \approx \sqrt{3}$) keliru mengambil akar.

**Jawaban: E**

**Soal 7:**
A $4.0\text{-kg}$ cart moves to the east at $3.0\text{ m/s}$ and collides head-on with a $2.0\text{-kg}$ cart moving to the west at $6.0\text{ m/s}$ on a frictionless track. Which statement about the total momentum of the two-cart system is correct?

A. The total momentum is $24\text{ kg}\cdot\text{m/s}$ east both before and after the collision.
B. The total momentum is $24\text{ kg}\cdot\text{m/s}$ before the collision and $0\text{ kg}\cdot\text{m/s}$ after the collision.
C. The total momentum is $0\text{ kg}\cdot\text{m/s}$ both before and after the collision.
D. The total momentum is $12\text{ kg}\cdot\text{m/s}$ east before the collision and $12\text{ kg}\cdot\text{m/s}$ west after the collision.
E. The total momentum after the collision cannot be determined without knowing if the collision is elastic.

---
**Pembahasan:**

* **Diketahui:** Tetapkan arah Timur ($+$) dan Barat ($-$). Kereta 1: $m_{1} = 4,0\text{ kg}$, $v_{1} = +3,0\text{ m/s}$. Kereta 2: $m_{2} = 2,0\text{ kg}$, $v_{2} = -6,0\text{ m/s}$. Lintasan tanpa gesekan.

* **Langkah Penyelesaian:**
  1. Hitung momentum masing-masing kereta sebelum tumbukan:
     $$
     p_{1} = (4,0)(+3,0) = +12,0\text{ kg}\cdot\text{m/s}\text{ (Timur)}
     $$
     $$
     p_{2} = (2,0)(-6,0) = -12,0\text{ kg}\cdot\text{m/s}\text{ (Barat)}
     $$
  2. Jumlahkan secara vektor untuk mendapatkan momentum total sebelum tumbukan:
     $$
     p_{\text{total, sebelum}} = p_{1} + p_{2} = +12,0 + (-12,0) = 0\text{ kg}\cdot\text{m/s}
     $$
  3. Karena lintasan tanpa gesekan (tidak ada gaya eksternal horizontal), Hukum Kekekalan Momentum berlaku untuk semua jenis tumbukan (baik elastis maupun tak lenting):
     $$
     p_{\text{total, sesudah}} = p_{\text{total, sebelum}} = 0\text{ kg}\cdot\text{m/s}
     $$

* **Analisis Opsi:** A dan B menjumlahkan besar skalar ($12 + 12 = 24$) dengan mengabaikan arah berlawanan; E keliru karena kekekalan momentum tidak mensyaratkan tumbukan harus elastis.

**Jawaban: C**

**Soal 8:**
Two clay gliders collide head-on on a frictionless air track and stick together after impact. Which statement is true regarding the total linear momentum and total kinetic energy of the two-glider system?

A. Both total momentum and total kinetic energy are conserved.
B. Total momentum is conserved, but total kinetic energy decreases.
C. Total kinetic energy is conserved, but total momentum decreases.
D. Neither total momentum nor total kinetic energy is conserved.
E. Total momentum increases while total kinetic energy remains unchanged.

---
**Pembahasan:**

* **Langkah Penyelesaian:**
  1. **Status Momentum Linier:** Kedua peluncur berada di rel udara tanpa gesekan (*frictionless air track*), sehingga resultan gaya eksternal horizontal sama dengan nol. Oleh karena itu, momentum linier total kekal.
  2. **Status Energi Kinetik:** Karena kedua benda terbuat dari tanah liat dan menempel bersama setelah tumbukan, tumbukan ini termasuk tumbukan tak lenting sama sekali (*completely inelastic collision*, $e = 0$). Sebagian besar energi kinetik berubah menjadi kalor, bunyi, dan energi deformasi permanen, sehingga energi kinetik total berkurang.

* **Analisis Opsi:** A hanya berlaku pada tumbukan elastis sempurna; C, D, dan E melanggar hukum kekekalan momentum pada sistem terisolasi.

**Jawaban: B**

**Soal 9:**
In an isolated system of two colliding objects, under what condition is the total mechanical kinetic energy of the system strictly conserved?

A. Only in perfectly elastic collisions.
B. In every collision where friction is negligible.
C. Only when the two colliding objects have identical masses.
D. Only in completely inelastic collisions where the objects stick together.
E. Whenever the total linear momentum before the collision equals zero.

---
**Pembahasan:**

* **Langkah Penyelesaian:**
  1. Dalam sistem terisolasi, momentum linier total selalu kekal untuk segala jenis tumbukan, tetapi energi kinetik mekanis total tidak otomatis kekal karena gaya interaksi internal selama kontak dapat bersifat non-konservatif (menghasilkan panas/deformasi).
  2. Secara definisi fisika, energi kinetik total sebelum tumbukan sama persis dengan energi kinetik total sesudah tumbukan ($\sum K_{\text{awal}} = \sum K_{\text{akhir}}$) hanya terjadi pada tumbukan lenting sempurna (*perfectly elastic collisions*).

* **Analisis Opsi:** B salah karena tanpa gesekan eksternal pun benda lunak tetap kehilangan energi kinetik (lihat Soal 8); C dan E tidak menjamin energi kinetik kekal; D justru kehilangan energi kinetik paling besar.

**Jawaban: A**

**Soal 10:**
On a frictionless air track, a steel glider moving at $2.5\text{ m/s}$ strikes an identical stationary steel glider head-on. Immediately after impact, the first glider comes to a complete stop and the second glider moves forward at $2.5\text{ m/s}$. This collision is...

A. completely inelastic.
B. partially inelastic.
C. impossible because linear momentum is not conserved.
D. elastic only if an external push acts during contact.
E. perfectly elastic.

---
**Pembahasan:**

* **Diketahui:** $m_{1} = m_{2} = m$, $v_{1i} = 2,5\text{ m/s}$, $v_{2i} = 0$, $v_{1f} = 0$, $v_{2f} = 2,5\text{ m/s}$.

* **Langkah Penyelesaian:**
  1. Periksa kekekalan momentum:
     $$
     p_{i} = m(2,5) + m(0) = 2,5m
     $$
     $$
     p_{f} = m(0) + m(2,5) = 2,5m \quad (\text{Kekal})
     $$
  2. Periksa kekekalan energi kinetik:
     $$
     K_{i} = \frac{1}{2}m(2,5)^{2} + 0 = 3,125m
     $$
     $$
     K_{f} = 0 + \frac{1}{2}m(2,5)^{2} = 3,125m \quad (\text{Kekal})
     $$
  3. Periksa koefisien restitusi:
     $$
     e = -\frac{v_{2f} - v_{1f}}{v_{2i} - v_{1i}} = -\frac{2,5 - 0}{0 - 2,5} = 1
     $$
     Karena momentum dan energi kinetik keduanya kekal ($e = 1$), tumbukan ini adalah tumbukan lenting sempurna (*perfectly elastic*).

* **Analisis Opsi:** A dan B membutuhkan $K_{f} < K_{i}$; C salah karena momentum terbukti kekal; D salah karena tidak diperlukan gaya luar.

**Jawaban: E**

**Soal 11:**
A very light ping-pong ball traveling at $8.0\text{ m/s}$ strikes a very heavy, stationary steel block head-on in a nearly elastic collision. Approximately what is the speed of the ping-pong ball immediately after rebounding?

A. $0\text{ m/s}$
B. $4.0\text{ m/s}$
C. $8.0\text{ m/s}$
D. $12.0\text{ m/s}$
E. $16.0\text{ m/s}$

---
**Pembahasan:**

* **Diketahui:** Bola pingpong sangat ringan ($m_{1}$) dengan $v_{1i} = +8,0\text{ m/s}$; balok baja sangat berat dan diam ($m_{2} \gg m_{1}$, $v_{2i} = 0$); tumbukan hampir elastis.

* **Langkah Penyelesaian:**
  1. Gunakan rumus kecepatan akhir benda pertama pada tumbukan lenting sempurna 1D dengan target diam:
     $$
     v_{1f} = \frac{m_{1} - m_{2}}{m_{1} + m_{2}}v_{1i} = \frac{(m_{1}/m_{2}) - 1}{(m_{1}/m_{2}) + 1}v_{1i}
     $$
  2. Karena $m_{1} \ll m_{2}$, rasio $m_{1}/m_{2} \approx 0$, sehingga:
     $$
     v_{1f} \approx \frac{0 - 1}{0 + 1}(8,0\text{ m/s}) = -8,0\text{ m/s} \implies \vert v_{1f} \vert \approx 8,0\text{ m/s}
     $$

* **Analisis Opsi:** A ($0\text{ m/s}$) terjadi jika menempel atau menumbuk benda bermassa sama; D dan E keliru membalik kasus menjadi benda berat menumbuk benda ringan.

**Jawaban: C**

**Soal 12:**
A small glass marble moving at $4.0\text{ m/s}$ to the right collides head-on with a stationary bowling ball on a smooth, frictionless floor. Assuming the collision is perfectly elastic, what is the speed of the marble immediately after bouncing back?

A. Slightly less than $4.0\text{ m/s}$
B. Exactly equal to $4.0\text{ m/s}$
C. Slightly greater than $4.0\text{ m/s}$
D. Exactly $2.0\text{ m/s}$
E. Exactly $0\text{ m/s}$

---
**Pembahasan:**

* **Analisis Ketelitian (Kontras dengan Soal 11):** Jika Soal 11 menanyakan nilai aproksimasi, Soal 12 menanyakan perbandingan eksak apakah kelajuan pantul sedikit kurang, tepat sama, atau sedikit lebih besar dari $4,0\text{ m/s}$.

* **Langkah Penyelesaian:**
  1. Dari persamaan eksak tumbukan elastis 1D dengan $v_{2i} = 0$ dan $0 < m_{1} \ll m_{2}$, kelajuan pantul kelereng adalah:
     $$
     \vert v_{1f} \vert = \frac{m_{2} - m_{1}}{m_{2} + m_{1}}v_{1i} = \frac{m_{2} - m_{1}}{m_{2} + m_{1}}(4,0\text{ m/s})
     $$
  2. Karena massa kelereng bernilai positif ($m_{1} > 0$) dan massa bola boling berhingga ($m_{2} < \infty$), maka pembilang selalu sedikit lebih kecil daripada penyebut: $m_{2} - m_{1} < m_{2} + m_{1}$, sehingga fraksi $(m_{2} - m_{1})/(m_{2} + m_{1})$ sedikit kurang dari $1$.
  3. **Tinjauan Energi:** Karena lantai licin tanpa gesekan, bola boling terdorong maju dengan kelajuan sangat kecil $v_{2f} > 0$ dan mengambil sedikit energi kinetik ($K_{2f} > 0$). Akibat kekekalan energi, $K_{1f} = K_{1i} - K_{2f} < K_{1i}$, sehingga $\vert v_{1f} \vert$ pasti sedikit kurang dari $4,0\text{ m/s}$.

* **Analisis Opsi:** B (tepat sama dengan $4,0\text{ m/s}$) hanya mungkin secara ideal jika $m_{2} \rightarrow \infty$ (dinding kaku tak bergerak); C melanggar hukum kekekalan energi.

**Jawaban: A**

**Soal 13:**
A billiard ball rolling at $6.5\text{ m/s}$ strikes an identical stationary billiard ball head-on in a perfectly elastic collision. What is the speed of the initially stationary ball immediately after the collision?

A. $0\text{ m/s}$
B. $1.6\text{ m/s}$
C. $3.25\text{ m/s}$
D. $6.5\text{ m/s}$
E. $13.0\text{ m/s}$

---
**Pembahasan:**

* **Diketahui:** $m_{1} = m_{2} = m$, $v_{1i} = 6,5\text{ m/s}$, $v_{2i} = 0$, tumbukan lenting sempurna sentral (*head-on*).

* **Langkah Penyelesaian:**
  1. Substitusikan $m_{1} = m_{2} = m$ ke rumus kecepatan akhir benda kedua (yang semula diam):
     $$
     v_{2f} = \frac{2m_{1}}{m_{1} + m_{2}}v_{1i} = \frac{2m}{m + m}(6,5\text{ m/s}) = 1 \times 6,5\text{ m/s} = 6,5\text{ m/s}
     $$
  2. Sementara itu, benda pertama berhenti total ($v_{1f} = 0$): kedua benda saling bertukar kecepatan sepenuhnya.

* **Analisis Opsi:** C ($3,25\text{ m/s} = \frac{1}{2} \times 6,5\text{ m/s}$) adalah hasil jika tumbukan tak lenting sama sekali (keduanya menempel).

**Jawaban: D**

**Soal 14:**
A massive locomotive moving at speed $v$ collides head-on with a very light, stationary foam ball on a frictionless surface. If the collision is elastic and the locomotive barely slows down, approximately what speed does the foam ball gain after impact?

A. Nearly $0.5v$
B. Nearly $v$
C. Nearly $2v$
D. Nearly $3v$
E. Nearly $4v$

---
**Pembahasan:**

* **Diketahui:** Lokomotif sangat berat ($m_{1} \gg m_{2}$) melaju dengan $v_{1i} = v$; bola busa sangat ringan diam ($v_{2i} = 0$); tumbukan elastis.

* **Langkah Penyelesaian:**
  1. Gunakan rumus kecepatan akhir target (bola busa) pada tumbukan elastis 1D:
     $$
     v_{2f} = \frac{2m_{1}}{m_{1} + m_{2}}v = \frac{2}{1 + (m_{2}/m_{1})}v
     $$
  2. Karena $m_{1} \gg m_{2}$, nilai $m_{2}/m_{1} \approx 0$, sehingga diperoleh:
     $$
     v_{2f} \approx \frac{2}{1 + 0}v = 2v
     $$
  3. **Intuisi Kerangka Acuan:** Dari sudut pandang masinis di lokomotif, bola busa datang mendekat dengan laju $v$ lalu memantul elastis menjauh dengan laju $v$ ke depan relatif terhadap lokomotif. Terhadap tanah, laju bola busa adalah $v_{\text{lokomotif}} + v_{\text{relatif}} = v + v = 2v$.

* **Analisis Opsi:** B (hampir $v$) hanya terjadi bila bola menempel pada lokomotif (tak lenting).

**Jawaban: C**

**Soal 15:**
A very light rubber pellet traveling at speed $v$ collides head-on with a very heavy, stationary metal cube resting on a frictionless sheet of ice. Assuming the collision is elastic, what is the speed of the heavy metal cube immediately after the collision?

A. Nearly $2v$
B. Slightly greater than $v$
C. Equal to $v$
D. Slightly less than $v$
E. Much less than $v$

---
**Pembahasan:**

* **Diketahui:** Peluru karet sangat ringan ($m_{1} \ll m_{2}$) dengan $v_{1i} = v$; kubus logam sangat berat diam ($v_{2i} = 0$) di atas es licin; tumbukan elastis.

* **Langkah Penyelesaian:**
  1. Hitung kecepatan akhir kubus logam ($v_{2f}$) dari persamaan tumbukan elastis 1D:
     $$
     v_{2f} = \frac{2m_{1}}{m_{1} + m_{2}}v \approx \frac{2m_{1}}{m_{2}}v
     $$
  2. Karena $m_{1} \ll m_{2}$, faktor $2m_{1}/m_{2}$ bernilai sangat jauh lebih kecil dari $1$, sehingga $v_{2f} \ll v$ (jauh lebih kecil daripada $v$).
  3. **Cek Kekekalan Momentum:** Peluru karet memantul balik dengan $\Delta p_{1} \approx -2m_{1}v$, sehingga kubus logam menerima impuls $+2m_{1}v$. Karena massa $m_{2}$ sangat besar, kecepatan rekoilnya $v_{2f} \approx (2m_{1}/m_{2})v$ sangat kecil sekali.

* **Analisis Opsi:** A (hampir $2v$) adalah jebakan dari Soal 14 (kasus terbalik); B, C, dan D mustahil karena melanggar kekekalan energi kinetik bagi benda yang jauh lebih masif.

**Jawaban: E**

**Soal 16:**
When a bicycle wheel accelerates while rolling without slipping along a paved road, which force between the tire and the road directly provides the torque that makes the wheel roll without skidding?

A. Kinetic friction
B. Static friction
C. Normal force
D. Air resistance
E. Gravitational force

---
**Pembahasan:**

* **Langkah Penyelesaian:**
  1. Pada kondisi menggelinding tanpa selip (*rolling without slipping*), kelajuan titik terbawah ban yang bersentuhan dengan aspal bernilai nol terhadap jalan ($v_{\text{kontak}} = v_{\text{pm}} - \omega R = 0$).
  2. Karena tidak terjadi pergeseran/selip relatif antara permukaan ban dan jalan di titik kontak, gaya gesek yang bekerja secara tangensial di permukaan ban adalah gaya gesek statis ($f_{s}$).
  3. Gaya gesek statis inilah yang memiliki lengan gaya sebesar jari-jari roda $R$ terhadap pusat massa roda sehingga menghasilkan torsi $\tau = f_{s}R$ yang membuat roda berotasi seiring percepatannya.

* **Analisis Opsi:** A (gaya gesek kinetis) hanya bekerja jika ban selip/tergelincir (*skidding*); C (gaya normal) dan E (gravitasi) memiliki garis kerja yang melewati poros pusat roda sehingga torsinya nol; D (hambatan udara) bukan gaya kontak ban-jalan.

**Jawaban: B**

**Soal 17:**
A mechanic attempts to loosen a rusted bolt using a wrench by applying the same force perpendicular to the handle in two trials. In Trial 1, the force is applied halfway along the handle; in Trial 2, the force is applied at the far end of the handle. Which trial produces the greater torque?

A. Trial 1, because the force is closer to the bolt.
B. Both trials produce the same non-zero torque because the force magnitude is identical.
C. Both trials produce zero torque because the force is perpendicular to the handle.
D. Trial 2, because the lever arm is longer.
E. It depends on the total mass of the wrench.

---
**Pembahasan:**

* **Diketahui:** Gaya sama ($F_{1} = F_{2} = F$), tegak lurus gagang ($\theta = 90^{\circ}$, $\sin 90^{\circ} = 1$). Panjang gagang kunci $L$; jarak titik kerja gaya pada Percobaan 1 adalah $r_{1} = \frac{1}{2}L$, sedangkan pada Percobaan 2 adalah $r_{2} = L$.

* **Langkah Penyelesaian:**
  1. Gunakan definisi besar torsi: $\tau = r F \sin\theta$.
  2. Hitung torsi pada kedua percobaan:
     $$
     \tau_{1} = \left(\frac{1}{2}L\right) F \sin 90^{\circ} = \frac{1}{2}FL
     $$
     $$
     \tau_{2} = L F \sin 90^{\circ} = FL = 2\tau_{1}
     $$
     Karena $r_{2} > r_{1}$, Percobaan 2 menghasilkan torsi dua kali lebih besar berkat lengan gaya (*lever arm*) yang lebih panjang.

* **Analisis Opsi:** A terbalik; B mengabaikan faktor $r$; C keliru karena $\sin 90^{\circ} = 1$ (torsi maksimum, bukan nol); E tidak relevan.

**Jawaban: D**

**Soal 18:**
Two identical forces of magnitude $F$ are applied at the very end of a uniform wrench handle. Force 1 pushes at an angle of $90^{\circ}$ to the handle, while Force 2 pushes at an angle of $45^{\circ}$ to the handle. Which statement comparing their torques about the bolt is correct?

A. Force 1 exerts a greater torque than Force 2.
B. Force 2 exerts a greater torque than Force 1.
C. Both forces exert equal non-zero torques because they act at the same distance from the bolt.
D. Force 2 exerts twice the torque of Force 1.
E. Neither force exerts a torque unless the bolt starts turning.

---
**Pembahasan:**

* **Diketahui:** Besar gaya sama ($F$) dan jarak dari poros baut sama ($r = L$). Sudut $\theta_{1} = 90^{\circ}$ dan $\theta_{2} = 45^{\circ}$.

* **Langkah Penyelesaian:**
  1. Hitung torsi Gaya 1 ($90^{\circ}$):
     $$
     \tau_{1} = L F \sin 90^{\circ} = L F (1) = L F
     $$
  2. Hitung torsi Gaya 2 ($45^{\circ}$):
     $$
     \tau_{2} = L F \sin 45^{\circ} = L F \left(\frac{\sqrt{2}}{2}\right) \approx 0,707 L F
     $$
  3. Bandingkan keduanya: $\tau_{1} > \tau_{2}$, sebab hanya komponen gaya yang tegak lurus gagang ($F\sin\theta$) yang menghasilkan torsi, dan nilai sinus maksimum dicapai pada $90^{\circ}$.

* **Analisis Opsi:** B, C, dan D salah secara trigonometri; E salah karena torsi tetap ada meskipun baut belum berputar (torsi adalah penyebab potensial rotasi, seperti gaya pada benda diam).

**Jawaban: A**

**Soal 19:**
Which physical quantity describes how strongly an object resists any change in its state of rotational motion about a given axis?

A. Linear momentum
B. Torque
C. Moment of inertia
D. Angular acceleration
E. Rotational kinetic energy

---
**Pembahasan:**

* **Langkah Penyelesaian:**
  1. Dalam gerak translasi, massa ($m$) menyatakan ukuran kelembaman (inersia) benda dalam mempertahankan keadaan gerak lurusnya ($a = F/m$).
  2. Dalam gerak rotasi, analog massa adalah momen inersia ($I = \sum m_{i}r_{i}^{2}$), yang menyatakan seberapa besar kecenderungan benda menolak perubahan kecepatan sudut terhadap sumbu putar tertentu ($\alpha = \tau/I$). Semakin besar $I$, semakin sulit benda dipercepat atau diperlambat rotasinya.

* **Analisis Opsi:** A (momentum linier) besaran gerak translasi; B (torsi) penyebab perubahan rotasi; D (percepatan sudut) akibat dari torsi; E (energi kinetik rotasi) energi akibat gerak putar.

**Jawaban: C**

**Soal 20:**
Two uniform solid cylinders have the exact same mass, but Cylinder B has twice the radius of Cylinder A ($R_{B} = 2R_{A}$). What is the ratio of the moment of inertia of Cylinder B to that of Cylinder A ($I_{B}/I_{A}$) about their central symmetry axes?

A. $0.25$
B. $0.5$
C. $2$
D. $4$
E. $8$

---
**Pembahasan:**

* **Diketahui:** Dua silinder pejal homogen (*uniform solid cylinders*), $M_{A} = M_{B} = M$ dan $R_{B} = 2R_{A}$.

* **Langkah Penyelesaian:**
  1. Momen inersia silinder pejal homogen terhadap sumbu simetri pusatnya adalah $I = \frac{1}{2}MR^{2}$.
  2. Bandingkan $I_{B}$ terhadap $I_{A}$:
     $$
     \frac{I_{B}}{I_{A}} = \frac{\frac{1}{2}MR_{B}^{2}}{\frac{1}{2}MR_{A}^{2}} = \left(\frac{R_{B}}{R_{A}}\right)^{2} = \left(\frac{2R_{A}}{R_{A}}\right)^{2} = 2^{2} = 4
     $$

* **Analisis Opsi:** A ($0,25$) adalah rasio terbalik $I_{A}/I_{B}$; C ($2$) lupa mengkuadratkan jari-jari; E ($8$) keliru memangkatkan tiga.

**Jawaban: D**

**Soal 21:**
A solid flywheel is mounted on a frictionless axle. If a constant, non-zero net torque is continuously applied to the flywheel, it will...

A. rotate with a constant angular velocity.
B. rotate with a constant angular acceleration.
C. experience a steadily increasing moment of inertia.
D. maintain a constant angular momentum.
E. rotate at constant speed until the torque is removed.

---
**Pembahasan:**

* **Langkah Penyelesaian:**
  1. Terapkan Hukum II Newton untuk gerak rotasi:
     $$
     \tau_{\text{net}} = I\alpha \implies \alpha = \frac{\tau_{\text{net}}}{I}
     $$
  2. Roda gila adalah benda tegar (*solid rigid body*) sehingga momen inersianya $I$ tetap konstan.
  3. Karena $\tau_{\text{net}}$ konstan dan tidak nol, maka rasio $\alpha = \tau_{\text{net}}/I$ juga konstan dan tidak nol. Artinya, roda gila berputar dengan percepatan sudut konstan (kecepatan sudutnya terus berubah secara linier terhadap waktu).

* **Analisis Opsi:** A, D, dan E hanya terjadi apabila $\tau_{\text{net}} = 0$; C salah karena $I$ hanya bergantung pada massa dan distribusi geometri benda tegar.

**Jawaban: B**

**Soal 22:**
A uniform solid cylinder of mass $M$ and radius $R$ starts from rest and rolls without slipping down a ramp of vertical height $h$. Upon reaching the bottom of the ramp, the cylinder's linear speed $v$ depends on...

A. the mass $M$ only.
B. the radius $R$ only.
C. both the mass $M$ and the radius $R$.
D. neither the mass $M$ nor the radius $R$.
E. the ratio $M/R^{2}$.

---
**Pembahasan:**

* **Diketahui:** Silinder pejal homogen ($I = \frac{1}{2}MR^{2}$), mulai dari diam ($v_{0} = 0$, $\omega_{0} = 0$), menggelinding tanpa selip ($\omega = v/R$) dari ketinggian vertikal $h$.

* **Langkah Penyelesaian:**
  1. Pada gerak menggelinding murni tanpa selip, gaya gesek statis tidak melakukan usaha (titik kontak sesaat diam), sehingga energi mekanik kekal:
     $$
     E_{p,\text{awal}} = K_{\text{trans}} + K_{\text{rot}} \implies Mgh = \frac{1}{2}Mv^{2} + \frac{1}{2}I\omega^{2}
     $$
  2. Substitusikan $I = \frac{1}{2}MR^{2}$ dan $\omega = \frac{v}{R}$:
     $$
     Mgh = \frac{1}{2}Mv^{2} + \frac{1}{2}\left(\frac{1}{2}MR^{2}\right)\left(\frac{v}{R}\right)^{2} = \frac{1}{2}Mv^{2} + \frac{1}{4}Mv^{2} = \frac{3}{4}Mv^{2}
     $$
  3. Perhatikan bahwa $R^{2}$ saling meniadakan dan massa $M$ pada kedua ruas juga habis dibagi:
     $$
     gh = \frac{3}{4}v^{2} \implies v = \sqrt{\frac{4}{3}gh}
     $$
     Hasil akhir $v$ hanya bergantung pada percepatan gravitasi $g$, ketinggian $h$, dan faktor bentuk ($\frac{1}{2}$ untuk silinder pejal), sehingga tidak bergantung pada massa $M$ maupun jari-jari $R$.

* **Analisis Opsi:** A, B, C, dan E semuanya mengira $M$ atau $R$ masih tersisa di rumus $v$.

**Jawaban: D**

**Soal 23:**
A uniform solid cylinder of mass $M$ and radius $R$ starts from rest and rolls without slipping down a ramp of vertical height $h$. Upon reaching the bottom of the ramp, the cylinder's angular velocity $\omega$ depends on...

A. the mass $M$ only.
B. the radius $R$ only.
C. both the mass $M$ and the radius $R$.
D. neither the mass $M$ nor the radius $R$.
E. the mass $M$ and the density of the cylinder only.

---
**Pembahasan:**

* **Langkah Penyelesaian:**
  1. Dari penurunan kekekalan energi pada Soal 22, kelajuan linier pusat massa di dasar bidang miring adalah $v = \sqrt{\frac{4}{3}gh}$.
  2. Karena silinder menggelinding tanpa selip, hubungan kecepatan sudut dan kelajuan linier adalah $v = \omega R$, sehingga:
     $$
     \omega = \frac{v}{R} = \frac{1}{R}\sqrt{\frac{4}{3}gh}
     $$
  3. Terlihat jelas bahwa massa $M$ tetap hilang, tetapi jari-jari $R$ muncul pada penyebut ($\omega \propto 1/R$). Silinder berjari-jari lebih kecil harus berputar lebih banyak kali (lebih cepat secara sudut) untuk menempuh lintasan yang sama dengan kelajuan $v$ yang sama.

* **Analisis Opsi:** D adalah jebakan utama bagi siswa yang menyamakan jawaban Nomor 23 dengan Nomor 22 tanpa melakukan pembagian $\omega = v/R$.

**Jawaban: B**

**Soal 24:**
Consider the statement: "Whenever a single non-zero external force acts on a rigid body, the body's angular momentum about a chosen pivot point must change." This statement is...

A. always true.
B. never true.
C. always false if the body is initially at rest.
D. sometimes true, depending only on the mass of the rigid body.
E. sometimes true, depending on the line of action of the force relative to the pivot.

---
**Pembahasan:**

* **Langkah Penyelesaian:**
  1. Laju perubahan momentum sudut terhadap titik poros tertentu ditentukan oleh torsi eksternal terhadap poros tersebut:
     $$
     \frac{dL}{dt} = \tau_{\text{ext}} = r \times F \implies \tau = r F \sin\theta = r_{\perp} F
     $$
  2. **Kasus 1 (Momentum sudut berubah):** Jika garis kerja gaya $F$ tidak melewati titik poros ($r_{\perp} \neq 0$), maka $\tau \neq 0$ sehingga $L$ pasti berubah.
  3. **Kasus 2 (Momentum sudut tetap):** Meskipun $F \neq 0$, jika garis kerja gaya diarahkan tepat melewati titik poros ($\theta = 0^{\circ}$ atau $180^{\circ}$, atau $r = 0$ sehingga lengan gaya $r_{\perp} = 0$), maka $\tau = 0$ dan $dL/dt = 0$. Akibatnya, momentum sudut terhadap poros tersebut tidak berubah.
  4. Dengan demikian, pernyataan tersebut kadang-kadang benar, bergantung pada garis kerja gaya relatif terhadap poros.

* **Analisis Opsi:** A mengabaikan kondisi $\sin\theta = 0$; B dan C salah karena gaya dengan $r_{\perp} \neq 0$ jelas mengubah $L$; D salah karena tidak bergantung pada massa.

**Jawaban: E**

**Soal 25:**
A comet travels around the Sun in a highly elongated elliptical orbit with negligible drag in space. As the comet orbits the Sun, what happens to its angular momentum about the Sun?

A. It remains constant throughout the entire orbit.
B. It increases as the comet approaches the Sun and decreases as it moves away.
C. It decreases continuously over each orbit.
D. It is zero at the farthest point from the Sun.
E. It reverses direction halfway through the orbit.

---
**Pembahasan:**

* **Langkah Penyelesaian:**
  1. Gaya dominan yang bekerja pada komet hanyalah gaya gravitasi Matahari ($F_{g}$), yang merupakan gaya sentral—arahnya selalu radial menuju pusat Matahari (berlawanan arah persis dengan vektor posisi $r$ dari Matahari ke komet, sudut $\theta = 180^{\circ}$).
  2. Hitung torsi gaya gravitasi terhadap Matahari:
     $$
     \tau = r \times F_{g} \implies \tau = r F_{g} \sin 180^{\circ} = 0
     $$
  3. Karena $\tau = 0$ dan hambatan ruang angkasa dapat diabaikan, maka $dL/dt = 0$, artinya momentum sudut komet terhadap Matahari konstan sepanjang seluruh orbitnya (inilah landasan fisis Hukum II Kepler).

* **Analisis Opsi:** B keliru mencampuradukkan momentum sudut $L$ dengan kelajuan orbit $v$ (kelajuan memang membesar saat dekat Matahari, tetapi $r$ mengecil sehingga $L = mrv_{\perp}$ tetap konstan).

**Jawaban: A**

**Soal 26:**
A satellite orbits Earth in an elliptical path. As the satellite moves from its closest point to Earth (perigee) toward its farthest point from Earth (apogee), what happens to its orbital speed?

A. It increases steadily.
B. It decreases steadily.
C. It remains strictly constant.
D. It drops to zero at the farthest point.
E. It increases at first and then remains constant.

---
**Pembahasan:**

* **Langkah Penyelesaian (Dua Pendekatan yang Saling Menguatkan):**
  1. **Via Kekekalan Momentum Sudut:** Seperti pada Soal 25, gaya gravitasi Bumi adalah gaya sentral sehingga $L = m r v_{\perp} = \text{konstan}$. Saat bergerak dari titik terdekat (*perigee*, $r_{\min}$) menuju titik terjauh (*apogee*, $r_{\max}$), jarak $r$ terus bertambah. Agar $L$ konstan, kelajuan orbit $v$ harus terus menurun secara stabil.
  2. **Via Kekekalan Energi Mekanik:** Energi total $E = \frac{1}{2}mv^{2} - \frac{GMm}{r}$ konstan. Ketika $r$ membesar, energi potensial gravitasi $U = -GMm/r$ meningkat (semakin tidak negatif), sehingga energi kinetik $K$ dan kelajuan $v$ terus menurun hingga mencapai nilai minimum (namun tidak nol) di *apogee*.

* **Analisis Opsi:** A terjadi saat bergerak dari *apogee* ke *perigee*; C hanya berlaku pada orbit lingkaran sempurna; D salah karena jika $v = 0$ di *apogee*, satelit akan jatuh lurus ke Bumi.

**Jawaban: B**

**Soal 27:**
A student sits on a frictionless rotating stool holding two heavy dumbbells close to her chest while spinning smoothly. She then extends her arms straight out to the sides. What happens to the total angular momentum of the student-stool-dumbbell system about the vertical axis?

A. It increases.
B. It decreases.
C. It drops to zero as soon as her arms are fully extended.
D. It remains unchanged.
E. It fluctuates depending on the mass of the dumbbells.

---
**Pembahasan:**

* **Langkah Penyelesaian:**
  1. Tinjau sistem utuh: siswa + kursi putar + dua barbel. Poros kursi bersifat licin tanpa gesekan (*frictionless*), sehingga tidak ada torsi gesek eksternal.
  2. Gaya otot saat siswa merentangkan kedua tangannya adalah gaya internal di dalam sistem (pasangan aksi-reaksi yang torsi internalnya saling meniadakan).
  3. Karena resultan torsi eksternal terhadap sumbu vertikal sama dengan nol ($\sum \tau_{\text{ext}} = 0$), berlaku Hukum Kekekalan Momentum Sudut:
     $$
     L_{\text{akhir}} = L_{\text{awal}} \implies I_{\text{akhir}}\omega_{\text{akhir}} = I_{\text{awal}}\omega_{\text{awal}}
     $$
     Jadi, momentum sudut total sistem tetap tidak berubah (yang berubah adalah $I$ naik dan $\omega$ turun secara proporsional).

* **Analisis Opsi:** A dan B keliru menyamakan $L$ dengan $I$ atau $\omega$; C mustahil tanpa rem/torsi luar.

**Jawaban: D**

**Soal 28:**
In the same situation (the spinning student on a frictionless stool extending her arms outward while holding the two dumbbells), what happens to the rotational kinetic energy of the system?

A. It decreases.
B. It increases.
C. It remains unchanged.
D. It doubles automatically.
E. It cannot be determined without knowing the initial angular speed.

---
**Pembahasan:**

* **Langkah Penyelesaian:**
  1. Saat lengan direntangkan, massa kedua barbel menjauhi sumbu rotasi sehingga momen inersia sistem meningkat: $I_{\text{akhir}} > I_{\text{awal}}$ (lihat Soal 29).
  2. Dari Soal 27, momentum sudut sistem kekal: $L_{\text{akhir}} = L_{\text{awal}} = L$.
  3. Nyatakan energi kinetik rotasi dalam besaran $L$ dan $I$ (analog dengan $K = p^{2}/(2m)$ pada gerak linier):
     $$
     K_{\text{rot}} = \frac{1}{2}I\omega^{2} = \frac{(I\omega)^{2}}{2I} = \frac{L^{2}}{2I}
     $$
  4. Karena $L$ konstan dan $I$ membesar ($I_{\text{akhir}} > I_{\text{awal}}$), maka rasio $L^{2}/(2I)$ menjadi lebih kecil:
     $$
     K_{\text{rot, akhir}} < K_{\text{rot, awal}}
     $$
  5. **Penjelasan Fisis:** Otot lengan siswa menahan gerak keluar barbel (melakukan usaha negatif pada barbel sehingga energi kinetik rotasi berkurang dan sebagian berubah menjadi energi internal/panas di otot). Sebaliknya, jika lengan ditarik masuk, otot melakukan usaha positif sehingga $K_{\text{rot}}$ bertambah.

* **Analisis Opsi:** C adalah miskonsepsi umum yang mengira kekekalan momentum sudut otomatis membuat energi kinetik juga kekal; E keliru karena arah perubahan pasti menurun tanpa perlu mengetahui nilai awal $\omega$.

**Jawaban: A**

**Soal 29:**
When the spinning student on the frictionless stool extends her arms outward while holding the two dumbbells, what happens to the system's moment of inertia about the axis of rotation?

A. It remains unchanged.
B. It decreases.
C. It drops to zero.
D. It depends on whether she rotates clockwise or counterclockwise.
E. It increases.

---
**Pembahasan:**

* **Langkah Penyelesaian:**
  1. Momen inersia sistem partikel/benda terhadap sumbu rotasi didefinisikan sebagai:
     $$
     I = \sum m_{i}r_{i}^{2}
     $$
  2. Ketika siswa merentangkan kedua lengan lurus ke samping, jarak tegak lurus ($r_{i}$) kedua barbel berat dan lengan terhadap sumbu putar vertikal bertambah besar secara signifikan.
  3. Karena setiap kontribusi sebanding dengan kuadrat jarak ($r_{i}^{2}$), maka momen inersia total sistem meningkat.

* **Analisis Opsi:** A mengabaikan perubahan distribusi massa; B terjadi bila lengan ditarik mendekati dada; D salah karena $I$ adalah besaran skalar yang tidak bergantung pada arah putaran.

**Jawaban: E**

**Soal 30:**
Assuming the Moon moves around Earth in a nearly circular orbit of radius $3.8 \times 10^{8}\text{ m}$ and completes one full revolution in $28\text{ days}$, approximately what arc length (distance along the curved path) does the Moon travel in $7\text{ days}$?

A. $1.9 \times 10^{8}\text{ m}$
B. $3.8 \times 10^{8}\text{ m}$
C. $6.0 \times 10^{8}\text{ m}$
D. $1.2 \times 10^{9}\text{ m}$
E. $2.4 \times 10^{9}\text{ m}$

---
**Pembahasan:**

* **Diketahui:** Jari-jari orbit $r = 3,8 \times 10^{8}\text{ m}$, periode revolusi $T = 28\text{ hari}$, selang waktu $t = 7\text{ hari}$.

* **Langkah Penyelesaian:**
  1. Tentukan bagian putaran yang ditempuh Bulan dalam $7\text{ hari}$:
     $$
     \frac{t}{T} = \frac{7\text{ hari}}{28\text{ hari}} = \frac{1}{4}\text{ putaran}
     $$
  2. Konversikan seperempat putaran ke perpindahan sudut dalam radian ($1\text{ putaran} = 2\pi\text{ rad}$):
     $$
     \theta = \frac{1}{4}(2\pi\text{ rad}) = \frac{\pi}{2}\text{ rad}
     $$
  3. Hitung panjang busur lintasan melengkung menggunakan rumus $s = r\theta$ (setara dengan seperempat keliling lingkaran $\frac{1}{4} \times 2\pi r$):
     $$
     s = r\theta = (3,8 \times 10^{8}\text{ m}) \times \frac{\pi}{2} = 1,9\pi \times 10^{8}\text{ m}
     $$
     $$
     s \approx 1,9 \times 3,1416 \times 10^{8}\text{ m} \approx 5,97 \times 10^{8}\text{ m} \approx 6,0 \times 10^{8}\text{ m}
     $$

* **Analisis Opsi:** A ($1,9 \times 10^{8}\text{ m}$) lupa mengalikan dengan $\pi$; B ($3,8 \times 10^{8}\text{ m}$) hanya menyalin nilai $r$; D ($1,2 \times 10^{9}\text{ m}$) adalah setengah keliling ($14\text{ hari}$); E ($2,4 \times 10^{9}\text{ m}$) adalah satu keliling penuh ($28\text{ hari}$).

**Jawaban: C**