# Latihan Soal dan Pembahasan SAS Fisika Kelas XI ICC — Paket 2

**Soal 1:**
What is the standard SI unit for linear momentum written in fundamental SI base units?

A. $\text{kg}\cdot\text{m/s}^{2}$
B. $\text{kg}\cdot\text{m}^{2}\text{/s}$
C. $\text{kg}\cdot\text{s/m}$
D. $\text{N}\cdot\text{m/s}$
E. $\text{kg}\cdot\text{m/s}$

---
**Pembahasan:**

* **Prinsip Fisika:** Momentum linier ($p$) didefinisikan sebagai hasil kali massa benda ($m$) dengan kecepatannya ($v$).

* **Langkah Penyelesaian:**
  1. Tuliskan persamaan momentum linier: $p = mv$.
  2. Substitusikan satuan pokok SI untuk massa ($\text{kg}$) dan satuan kecepatan ($\text{m/s}$):
     $$[p] = [m] \cdot [v] = \text{kg}\cdot\text{m/s}$$
     Ketiga satuan penyusunnya ($\text{kg}$, $\text{m}$, dan $\text{s}$) merupakan satuan pokok SI (*fundamental SI base units*).

* **Analisis Opsi:** A ($\text{kg}\cdot\text{m/s}^{2}$) adalah satuan gaya (newton); B ($\text{kg}\cdot\text{m}^{2}\text{/s}$) adalah satuan momentum sudut; C ($\text{kg}\cdot\text{s/m}$) bukan satuan momentum; D ($\text{N}\cdot\text{m/s}$) adalah satuan daya (watt) dan memakai satuan turunan $\text{N}$. Jawaban benar adalah E ($\text{kg}\cdot\text{m/s}$).

**Jawaban: E**

**Soal 2:**
When a cannon fires a cannonball, the cannon will move backward (recoil) because...

A. the energy of the cannonball and cannon is conserved.
B. the momentum of the cannonball and cannon is conserved.
C. the energy of the cannon is greater than the energy of the cannonball.
D. the momentum of the cannon is greater than the energy of the cannonball.
E. the forward force is less than the backward force.

---
**Pembahasan:**

* **Analisis Sistem:** Tinjau sistem meriam + peluru meriam sesaat sebelum dan sesaat sesudah ledakan mesiu. Gaya ledakan merupakan gaya internal yang saling berlawanan arah dan sama besar; tidak ada gaya eksternal horizontal signifikan selama selang waktu penembakan singkat tersebut.

* **Langkah Penyelesaian:**
  1. Sebelum ditembakkan, sistem diam sehingga momentum total awal nol: $p_{\text{awal}} = 0$.
  2. Menurut Hukum Kekekalan Momentum Linier, momentum total sesudah penembakan harus tetap nol:
     $$m_{\text{meriam}}v_{\text{meriam}} + m_{\text{peluru}}v_{\text{peluru}} = 0 \implies v_{\text{meriam}} = -\frac{m_{\text{peluru}}}{m_{\text{meriam}}}v_{\text{peluru}}$$
     Tanda minus menunjukkan meriam terpental ke belakang (*recoil*) agar momentum negatif meriam mengimbangi momentum positif peluru.

* **Analisis Opsi:** A salah karena energi kinetik tidak kekal (bertambah dari energi kimia mesiu); C salah karena dengan $p$ sama, $K = p^{2}/(2m)$ justru lebih kecil pada meriam yang bermassa jauh lebih besar; D membandingkan dua besaran berbeda dimensi (momentum vs. energi); E melanggar Hukum III Newton. Jawaban benar adalah B.

**Jawaban: B**

**Soal 3:**
A mine cart glides along a smooth, horizontal, frictionless railway at a constant speed. A small rock drops vertically through a hole in the bottom of the cart without being pushed forward or backward. What happens to the horizontal speed of the cart?

A. It decreases steadily.
B. It increases immediately.
C. It remains unchanged.
D. It drops to half its original value.
E. It depends on the mass of the rock that fell out.

---
**Pembahasan:**

* **Identifikasi Kunci:** Batu jatuh vertikal melalui lubang tanpa didorong ke depan maupun ke belakang (*without being pushed forward or backward*). Ini berarti tidak ada gaya maupun impuls horizontal yang bekerja antara batu dan lori saat batu terlepas.

* **Langkah Penyelesaian:**
  1. Saat keluar dari lubang, batu tetap memiliki komponen kecepatan horizontal yang sama dengan lori ($v_{x,\text{batu}} = v$) akibat kelembaman (Hukum I Newton).
  2. Terapkan kekekalan momentum horizontal pada sistem (lori bermassa $m_{L}$ + batu bermassa $m_{b}$):
     $$(m_{L} + m_{b})v = m_{L}v_{L}' + m_{b}v \implies m_{L}v = m_{L}v_{L}' \implies v_{L}' = v$$
     Dengan demikian, kelajuan horizontal lori tidak berubah sama sekali.

* **Analisis Opsi:** B adalah miskonsepsi klasik yang mengira pengurangan massa otomatis mempercepat benda tanpa memperhitungkan bahwa batu membawa serta momentum horizontalnya ($m_{b}v$); A, D, dan E keliru karena tidak ada gaya gesek maupun impuls horizontal. Jawaban benar adalah C (*It remains unchanged*).

**Jawaban: C**

**Soal 4:**
A steel sphere and a lump of wet dough have identical masses and are launched horizontally at the same speed toward a rigid steel plate. The steel sphere rebounds straight back at nearly its initial speed, whereas the wet dough sticks to the plate. Which object receives the greater magnitude of impulse from the plate?

A. The wet dough, because it remains in contact longer.
B. Both receive the same impulse because their masses and initial speeds are equal.
C. Neither receives an impulse because the plate does not move.
D. The steel sphere, because its velocity reverses direction.
E. It cannot be determined without knowing the collision duration.

---
**Pembahasan:**

* **Konvensi Arah:** Tetapkan arah menuju pelat baja sebagai positif ($+$) dan arah memantul balik sebagai negatif ($-$). Keduanya bermassa sama ($m$) dengan kecepatan awal $v_{i} = +v$.

* **Langkah Penyelesaian:**
  1. Gunakan Teorema Impuls-Momentum ($J = \Delta p = m(v_{f} - v_{i})$).
  2. Bola Baja (memantul lurus ke belakang dengan kelajuan hampir sama, $v_{f} \approx -v$):
     $$J_{\text{baja}} = m(-v - v) = -2mv \implies \vert J_{\text{baja}} \vert \approx 2mv$$
  3. Adonan Basah (menempel dan berhenti di pelat, $v_{f} = 0$):
     $$J_{\text{adonan}} = m(0 - v) = -mv \implies \vert J_{\text{adonan}} \vert = mv$$
     Pelat baja harus memberikan impuls untuk menghentikan bola baja ($mv$) sekaligus mendorongnya balik ke arah berlawanan ($mv$ lagi), sehingga bola baja menerima impuls sekitar dua kali lebih besar karena arah kecepatannya berbalik.

* **Analisis Opsi:** A dan E keliru karena besar impuls sama dengan $\vert \Delta p \vert$ yang dapat ditentukan langsung dari perubahan kecepatan tanpa perlu mengetahui durasi kontak $\Delta t$; B mengabaikan sifat vektor kecepatan; C salah karena pelat tetap memberi gaya normal penahan meski tidak bergerak. Jawaban benar adalah D.

**Jawaban: D**

**Soal 5:**
A sailboat with mass $m$ is moving with a momentum $p$. How do you write its kinetic energy using only these two symbols?

A. $p^{2}/(2m)$
B. $(1/2)mp^{2}$
C. $mp$
D. $mp/2$
E. $2mp^{2}$

---
**Pembahasan:**

* **Langkah Penyelesaian:**
  1. Dari definisi momentum linier $p = mv$, nyatakan kelajuan sebagai $v = p/m$.
  2. Substitusikan $v$ ke dalam rumus energi kinetik translasi $K = \frac{1}{2}mv^{2}$:
     $$K = \frac{1}{2}m\left(\frac{p}{m}\right)^{2} = \frac{1}{2}m\frac{p^{2}}{m^{2}} = \frac{p^{2}}{2m}$$

* **Verifikasi Satuan:** $(\text{kg}\cdot\text{m/s})^{2}\text{/kg} = \text{kg}\cdot\text{m}^{2}\text{/s}^{2} = \text{Joule}$ (tepat). Opsi B, C, D, dan E memiliki dimensi satuan yang tidak sesuai dengan energi. Jawaban benar adalah A ($p^{2}/(2m)$).

**Jawaban: A**

**Soal 6:**
A bowling ball is rolled down a lane so that it has four times the kinetic energy of a previous roll with the same ball. How does the magnitude of its new momentum compare to its previous momentum?

A. It is the same.
B. It is $1.41$ times as large.
C. It is $4$ times as large.
D. It is $16$ times as large.
E. It is $2$ times as large.

---
**Pembahasan:**

* **Diketahui:** Bola boling yang sama ($m_{2} = m_{1} = m$), energi kinetik baru $K_{2} = 4K_{1}$.

* **Langkah Penyelesaian:**
  1. Dari Soal 5, $K = p^{2}/(2m) \iff p = \sqrt{2mK}$. Untuk massa tetap, momentum berbanding lurus dengan akar kuadrat energi kinetik ($p \propto \sqrt{K}$).
  2. Bandingkan momentum baru ($p_{2}$) terhadap momentum sebelumnya ($p_{1}$):
     $$\frac{p_{2}}{p_{1}} = \sqrt{\frac{K_{2}}{K_{1}}} = \sqrt{\frac{4K_{1}}{K_{1}}} = \sqrt{4} = 2 \implies p_{2} = 2p_{1}$$

* **Analisis Opsi:** C ($4$ kali) mengira $p$ berbanding lurus dengan $K$; D ($16$ kali) terbalik mengkuadratkan $4$ alih-alih menarik akar; B ($1,41 \approx \sqrt{2}$) memakai faktor $2$ bukan $4$. Jawaban benar adalah E (*It is 2 times as large*).

**Jawaban: E**

**Soal 7:**
A $5.0\text{-kg}$ trolley moves to the right at $2.0\text{ m/s}$ and collides head-on with a $2.5\text{-kg}$ trolley moving to the left at $4.0\text{ m/s}$ on a frictionless surface. Which statement is correct?

A. The total momentum is $20\text{ kg}\cdot\text{m/s}$ both before and after the collision.
B. The total momentum is $20\text{ kg}\cdot\text{m/s}$ before the collision and $0\text{ kg}\cdot\text{m/s}$ after the collision.
C. The total momentum is $10\text{ kg}\cdot\text{m/s}$ to the right both before and after the collision.
D. The total momentum is $0\text{ kg}\cdot\text{m/s}$ both before and after the collision.
E. The total momentum is $10\text{ kg}\cdot\text{m/s}$ before the collision and $0\text{ kg}\cdot\text{m/s}$ after the collision.

---
**Pembahasan:**

* **Diketahui:** Tetapkan arah kanan ($+$) dan kiri ($-$). Troli 1: $m_{1} = 5,0\text{ kg}$, $v_{1} = +2,0\text{ m/s}$. Troli 2: $m_{2} = 2,5\text{ kg}$, $v_{2} = -4,0\text{ m/s}$. Permukaan tanpa gesekan.

* **Langkah Penyelesaian:**
  1. Hitung momentum linier masing-masing troli sebelum tumbukan:
     $$p_{1} = (5,0)(+2,0) = +10,0\text{ kg}\cdot\text{m/s}\text{ (kanan)}$$
     $$p_{2} = (2,5)(-4,0) = -10,0\text{ kg}\cdot\text{m/s}\text{ (kiri)}$$
  2. Hitung momentum total sistem sebelum tumbukan secara vektor:
     $$p_{\text{total, sebelum}} = p_{1} + p_{2} = +10,0 + (-10,0) = 0\text{ kg}\cdot\text{m/s}$$
  3. Karena permukaan licin (resultan gaya luar horizontal nol), berlaku kekekalan momentum:
     $$p_{\text{total, sesudah}} = p_{\text{total, sebelum}} = 0\text{ kg}\cdot\text{m/s}$$

* **Analisis Opsi:** A dan B keliru menjumlahkan besar skalar ($10 + 10 = 20$) tanpa memperhatikan tanda negatif arah kiri; C dan E hanya menghitung momentum satu troli saja. Jawaban benar adalah D.

**Jawaban: D**

**Soal 8:**
During a perfectly elastic collision between two isolated spheres, total linear momentum is conserved. What is true about the total kinetic energy of the two-sphere system?

A. It increases because the spheres rebound.
B. It decreases slightly due to brief compression.
C. It drops to zero immediately after the collision.
D. It depends on the mass ratio of the two spheres.
E. It is also conserved.

---
**Pembahasan:**

* **Langkah Penyelesaian:**
  1. Pada tumbukan lenting sempurna (*perfectly elastic collision*), tidak ada energi mekanik yang terdisipasi permanen menjadi panas, bunyi, atau perubahan bentuk permanen.
  2. Meskipun sesaat pada puncak kontak sebagian energi kinetik berubah sementara menjadi energi potensial elastis akibat pemampatan, seluruh energi tersebut dikembalikan penuh menjadi energi kinetik ketika kedua bola berpisah. Oleh sebab itu, energi kinetik total sistem juga kekal ($\sum K_{\text{awal}} = \sum K_{\text{akhir}}$).

* **Analisis Opsi:** A melanggar kekekalan energi; B adalah sifat tumbukan tak lenting sebagian; C hanya terjadi pada kasus khusus tak lenting dengan $p_{\text{total}} = 0$; D salah karena kekekalan $K$ berlaku untuk segala perbandingan massa pada tumbukan elastis. Jawaban benar adalah E (*It is also conserved*).

**Jawaban: E**

**Soal 9:**
In which type of collision between two isolated objects is total kinetic energy NOT conserved, even though total linear momentum IS conserved?

A. An inelastic collision.
B. A perfectly elastic collision.
C. Only collisions occurring in deep space.
D. Only collisions between objects of identical mass.
E. No collision can conserve momentum without conserving kinetic energy.

---
**Pembahasan:**

* **Langkah Penyelesaian:**
  1. Dalam sistem terisolasi ($\sum F_{\text{ext}} = 0$), momentum linier total selalu kekal pada semua jenis tumbukan.
  2. Namun, energi kinetik total tidak kekal (berkurang karena sebagian diubah menjadi kalor, bunyi, atau deformasi) pada tumbukan tidak lenting (*inelastic collision*)—baik tak lenting sebagian ($0 < e < 1$) maupun tak lenting sama sekali ($e = 0$).

* **Analisis Opsi:** B justru mengekalkan energi kinetik; C dan D bukan kriteria jenis tumbukan; E keliru karena hampir semua tumbukan makroskopis mengekalkan momentum tanpa mengekalkan energi kinetik. Jawaban benar adalah A (*An inelastic collision*).

**Jawaban: A**

**Soal 10:**
In a Newton's cradle demonstration, a swinging steel ball strikes a stationary identical steel ball head-on. The first ball stops completely while the second ball swings away with the exact same speed the first ball had just before impact. What type of collision is this?

A. Completely inelastic
B. Partially inelastic
C. Elastic
D. Explosive separation
E. Either elastic or inelastic, depending on the string length

---
**Pembahasan:**

* **Diketahui:** $m_{1} = m_{2} = m$, $v_{1i} = v$, $v_{2i} = 0$, $v_{1f} = 0$, $v_{2f} = v$.

* **Langkah Penyelesaian:**
  1. Uji kekekalan momentum:
     $$p_{i} = mv + 0 = mv \quad \text{dan} \quad p_{f} = 0 + mv = mv \quad (\text{Kekal})$$
  2. Uji kekekalan energi kinetik:
     $$K_{i} = \frac{1}{2}mv^{2} + 0 = \frac{1}{2}mv^{2} \quad \text{dan} \quad K_{f} = 0 + \frac{1}{2}mv^{2} = \frac{1}{2}mv^{2} \quad (\text{Kekal})$$
  3. Koefisien restitusi:
     $$e = -\frac{v_{2f} - v_{1f}}{v_{2i} - v_{1i}} = -\frac{v - 0}{0 - v} = 1$$
     Pertukaran kecepatan penuh antara dua benda bermassa identik yang mengekalkan momentum dan energi kinetik sekaligus merupakan ciri khas tumbukan elastis (lenting sempurna).

* **Analisis Opsi:** A dan B mengharuskan berkurangnya energi kinetik; D terjadi saat energi kinetik bertambah dari ledakan internal; E salah karena jenis tumbukan tidak bergantung pada panjang tali. Jawaban benar adalah C (*Elastic*).

**Jawaban: C**

**Soal 11:**
A very light tennis ball traveling horizontally at $10.0\text{ m/s}$ strikes a massive, stationary concrete pillar head-on in a nearly elastic collision. Approximately what is the speed of the tennis ball immediately after rebounding?

A. $0\text{ m/s}$
B. $5.0\text{ m/s}$
C. $10.0\text{ m/s}$
D. $15.0\text{ m/s}$
E. $20.0\text{ m/s}$

---
**Pembahasan:**

* **Diketahui:** Bola tenis sangat ringan ($m_{1}$) dengan $v_{1i} = +10,0\text{ m/s}$; pilar beton sangat masif dan diam ($m_{2} \gg m_{1}$, $v_{2i} = 0$); tumbukan hampir elastis.

* **Langkah Penyelesaian:**
  1. Gunakan persamaan kecepatan akhir benda penumbuk pada tumbukan elastis 1D dengan target diam:
     $$v_{1f} = \frac{m_{1} - m_{2}}{m_{1} + m_{2}}v_{1i} = \frac{(m_{1}/m_{2}) - 1}{(m_{1}/m_{2}) + 1}v_{1i}$$
  2. Dalam batas $m_{1}/m_{2} \rightarrow 0$ (karena massa pilar jauh lebih besar dan tertanam di tanah), diperoleh:
     $$v_{1f} \approx (-1)(10,0\text{ m/s}) = -10,0\text{ m/s} \implies \vert v_{1f} \vert \approx 10,0\text{ m/s}$$

* **Analisis Opsi:** A ($0\text{ m/s}$) terjadi jika menempel; E ($20,0\text{ m/s} = 2v$) adalah kasus terbalik (benda masif bergerak menumbuk benda ringan diam). Jawaban benar adalah C ($10,0\text{ m/s}$).

**Jawaban: C**

**Soal 12:**
A table-tennis ball moving to the right at $5.0\text{ m/s}$ collides head-on with a stationary solid iron cannonball in a frictionless environment. If the collision is perfectly elastic, what is the rebound speed of the table-tennis ball immediately after impact?

A. Slightly less than $5.0\text{ m/s}$
B. Slightly greater than $5.0\text{ m/s}$
C. Exactly equal to $5.0\text{ m/s}$
D. Half of $5.0\text{ m/s}$
E. Exactly zero

---
**Pembahasan:**

* **Analisis Ketelitian:** Bola meriam besi ($m_{2}$) memang sangat berat dibanding bola pingpong ($m_{1}$), tetapi berada di lingkungan tanpa gesekan sehingga bebas bergerak sedikit ke kanan setelah ditumbuk.

* **Langkah Penyelesaian:**
  1. Dari rumus eksak tumbukan elastis 1D untuk $v_{2i} = 0$ dan $0 < m_{1} \ll m_{2}$:
     $$\vert v_{1f} \vert = \frac{m_{2} - m_{1}}{m_{2} + m_{1}}v_{1i} = \frac{m_{2} - m_{1}}{m_{2} + m_{1}}(5,0\text{ m/s})$$
  2. Karena $m_{1} > 0$ dan $m_{2}$ bernilai berhingga, selalu berlaku $(m_{2} - m_{1})/(m_{2} + m_{1}) < 1$ (sangat dekat dengan $1$, namun secara ketat kurang dari $1$).
  3. **Alasan Fisis (Kekekalan Energi):** Bola meriam menerima sedikit dorongan sehingga memperoleh kelajuan sangat kecil $v_{2f} > 0$ dan energi kinetik $K_{2f} > 0$. Karena energi kinetik total kekal ($K_{1f} = K_{1i} - K_{2f} < K_{1i}$), kelajuan pantul bola pingpong harus sedikit kurang dari $5,0\text{ m/s}$.

* **Analisis Opsi:** C (tepat sama dengan $5,0\text{ m/s}$) hanya berlaku dalam limit ideal $m_{2} \rightarrow \infty$; B melanggar hukum kekekalan energi. Jawaban benar adalah A (*Slightly less than $5.0\text{ m/s}$*).

**Jawaban: A**

**Soal 13:**
A rubber ball moving at a speed of $5.0\text{ m/s}$ collides head-on elastically with an identical ball that is at rest. What is the speed of the initially stopped ball after the collision?

A. zero
B. $1.0\text{ m/s}$
C. $2.5\text{ m/s}$
D. $5.0\text{ m/s}$
E. $10.0\text{ m/s}$

---
**Pembahasan:**

* **Diketahui:** $m_{1} = m_{2} = m$, $v_{1i} = 5,0\text{ m/s}$, $v_{2i} = 0$, tumbukan elastis 1D.

* **Langkah Penyelesaian:**
  1. Substitusikan $m_{1} = m_{2} = m$ ke rumus kecepatan akhir benda kedua (yang awalnya diam):
     $$v_{2f} = \frac{2m_{1}}{m_{1} + m_{2}}v_{1i} = \frac{2m}{2m}(5,0\text{ m/s}) = 5,0\text{ m/s}$$
  2. Sementara itu, bola pertama berhenti ($v_{1f} = 0$) karena seluruh momentum dan energi kinetiknya berpindah ke bola kedua.

* **Analisis Opsi:** C ($2,5\text{ m/s}$) adalah hasil untuk tumbukan tak lenting sama sekali (menempel bersama); A ($0\text{ m/s}$) adalah kelajuan bola pertama, bukan bola yang semula diam. Jawaban benar adalah D ($5,0\text{ m/s}$).

**Jawaban: D**

**Soal 14:**
A very heavy delivery truck moving at speed $v$ strikes a very light, stationary empty cardboard box head-on on an icy, frictionless road. Assuming the collision is elastic and the truck barely slows down, approximately how fast does the box move immediately after the collision?

A. Nearly $0$
B. Nearly $v/2$
C. Nearly $v$
D. Nearly $2v$
E. Nearly $4v$

---
**Pembahasan:**

* **Diketahui:** Truk sangat berat ($m_{1} \gg m_{2}$) dengan $v_{1i} = v$; kotak kardus kosong sangat ringan diam ($v_{2i} = 0$); tumbukan elastis di jalan es licin.

* **Langkah Penyelesaian:**
  1. Gunakan rumus kecepatan akhir target (kotak kardus) pada tumbukan elastis 1D:
     $$v_{2f} = \frac{2m_{1}}{m_{1} + m_{2}}v = \frac{2}{1 + (m_{2}/m_{1})}v$$
  2. Karena $m_{2}/m_{1} \approx 0$, diperoleh:
     $$v_{2f} \approx \frac{2}{1 + 0}v = 2v$$
  3. **Verifikasi Koefisien Restitusi ($e = 1$):** Laju saling menjauh harus sama dengan laju saling mendekat ($v_{2f} - v_{1f} = v_{1i} - v_{2i}$). Karena truk hampir tidak melambat ($v_{1f} \approx v$), maka $v_{2f} - v \approx v - 0 \implies v_{2f} \approx 2v$.

* **Analisis Opsi:** C (hampir $v$) adalah jebakan intuitif yang hanya berlaku jika kotak menempel pada bumper truk (tumbukan tak lenting). Jawaban benar adalah D (*Nearly $2v$*).

**Jawaban: D**

**Soal 15:**
A tiny, very light plastic bead moving at speed $v$ strikes a massive, stationary brass cylinder head-on on a frictionless surface in a nearly elastic collision. Immediately after impact, the speed of the massive brass cylinder is...

A. nearly $2v$.
B. equal to $v$.
C. slightly less than $v$.
D. approximately $v/2$.
E. much less than $v$.

---
**Pembahasan:**

* **Diketahui:** Manik plastik sangat ringan ($m_{1} \ll m_{2}$) dengan $v_{1i} = v$; silinder kuningan sangat berat diam ($v_{2i} = 0$) di permukaan licin; tumbukan hampir elastis.

* **Langkah Penyelesaian:**
  1. Hitung kecepatan akhir silinder kuningan ($v_{2f}$) dari persamaan tumbukan elastis 1D:
     $$v_{2f} = \frac{2m_{1}}{m_{1} + m_{2}}v \approx \frac{2m_{1}}{m_{2}}v$$
  2. Karena $m_{1} \ll m_{2}$, rasio $2m_{1}/m_{2} \ll 1$. Akibatnya, kelajuan silinder kuningan segera sesudah tumbukan jauh lebih kecil daripada $v$ ($v_{2f} \ll v$).
  3. **Cek Logika Fisis:** Manik plastik memantul balik dengan perubahan momentum $\vert \Delta p \vert \approx 2m_{1}v$. Meski silinder kuningan menerima impuls yang sama besar, massanya yang raksasa membuat pertambahan kecepatannya nyaris tak terasa.

* **Analisis Opsi:** A (hampir $2v$) adalah kasus terbalik (Soal 14); B, C, dan D mustahil karena memberi energi kinetik jauh melebihi energi kinetik awal manik plastik. Jawaban benar adalah E (*much less than $v$*).

**Jawaban: E**

**Soal 16:**
For a solid cylinder to roll smoothly down an inclined board without slipping, which force must act at the contact point between the cylinder and the board?

A. Kinetic friction
B. Static friction
C. Centripetal tension
D. Buoyant force
E. Air drag

---
**Pembahasan:**

* **Langkah Penyelesaian:**
  1. Jika papan miring benar-benar licin, silinder hanya akan meluncur turun tanpa berputar karena gaya gravitasi dan gaya normal sama-sama melewati pusat massa sehingga torsinya nol.
  2. Agar silinder menggelinding mulus tanpa selip, harus ada gaya tangensial di titik sentuh yang menghasilkan torsi terhadap pusat massa ($\tau = f_{s}R$).
  3. Karena syarat tanpa selip berarti titik sentuh terbawah silinder sesaat diam relatif terhadap papan ($v_{\text{kontak}} = v_{\text{pm}} - \omega R = 0$), gaya gesek yang bekerja adalah gaya gesek statis ($f_{s}$).

* **Analisis Opsi:** A (gaya gesek kinetis) hanya bekerja jika silinder tergelincir/selip; C, D, dan E bukan gaya kontak permukaan miring penghasil rotasi murni. Jawaban benar adalah B (*Static friction*).

**Jawaban: B**

**Soal 17:**
Two equal forces are applied to a door. The first force is applied at the midpoint of the door, and the second force is applied at the doorknob. Both forces are applied perpendicular to the door. Which force exerts the greater torque?

A. the first force at the midpoint
B. the second force at the doorknob
C. both exert equal non-zero torques
D. both exert zero torques
E. it depends on the door's total mass

---
**Pembahasan:**

* **Diketahui:** Besar gaya sama ($F_{1} = F_{2} = F$), keduanya tegak lurus daun pintu ($\theta = 90^{\circ}$, $\sin 90^{\circ} = 1$). Poros rotasi adalah engsel pintu. Jarak engsel ke gagang pintu ($r_{2}$) lebih panjang dibanding ke titik tengah pintu ($r_{1} \approx \frac{1}{2}r_{2}$).

* **Langkah Penyelesaian:**
  1. Hitung besar torsi masing-masing gaya dengan $\tau = r F \sin 90^{\circ} = r F$:
     $$\tau_{1} = r_{1}F \quad \text{dan} \quad \tau_{2} = r_{2}F$$
  2. Karena $r_{2} > r_{1}$, maka $\tau_{2} > \tau_{1}$. Gaya kedua yang bekerja di gagang pintu memiliki lengan gaya jauh lebih panjang sehingga menghasilkan torsi lebih besar (inilah sebabnya gagang pintu selalu dipasang sejauh mungkin dari engsel).

* **Analisis Opsi:** A terbalik; C mengabaikan perbedaan jarak dari engsel; D keliru karena $\sin 90^{\circ} = 1$ bukan $0$; E tidak memengaruhi besar torsi gaya luar. Jawaban benar adalah B (*the second force at the doorknob*).

**Jawaban: B**

**Soal 18:**
Two equal forces are applied at the outer edge of a pivoted playground gate. Force P is applied perpendicular (at a $90^{\circ}$ angle) to the gate, while Force Q is applied at a $60^{\circ}$ angle to the plane of the gate. Which force produces the greater torque about the hinges?

A. Force P, because the perpendicular component is largest at $90^{\circ}$.
B. Force Q, because a smaller angle creates a stronger twist.
C. Both exert equal non-zero torques because their magnitudes are equal.
D. Both exert zero torque unless the gate is already moving.
E. Force Q produces exactly half the torque of Force P.

---
**Pembahasan:**

* **Diketahui:** Besar gaya sama ($F_{P} = F_{Q} = F$), bekerja di tepi terluar gerbang ($r_{P} = r_{Q} = L$). Sudut kerja: $\theta_{P} = 90^{\circ}$ dan $\theta_{Q} = 60^{\circ}$.

* **Langkah Penyelesaian:**
  1. Gunakan persamaan torsi $\tau = r F \sin\theta = r F_{\perp}$:
     $$\tau_{P} = L F \sin 90^{\circ} = 1,00 L F$$
     $$\tau_{Q} = L F \sin 60^{\circ} = \frac{\sqrt{3}}{2} L F \approx 0,866 L F$$
  2. Bandingkan hasilnya: $\tau_{P} > \tau_{Q}$, karena komponen gaya tegak lurus bidang gerbang ($F_{\perp} = F\sin\theta$) mencapai nilai maksimum saat $\theta = 90^{\circ}$.

* **Analisis Opsi:** B dan C salah secara konsep vektor; D salah karena torsi tetap bekerja walau gerbang masih diam; E adalah jebakan pintar karena $\sin 60^{\circ} \approx 0,866$, bukan setengahnya (setengah torsi terjadi pada $30^{\circ}$ karena $\sin 30^{\circ} = 0,5$). Jawaban benar adalah A.

**Jawaban: A**

**Soal 19:**
In rotational dynamics, what is the rotational equivalent of mass—the property that measures an object's resistance to angular acceleration?

A. Angular momentum
B. Torque
C. Angular displacement
D. Moment of inertia
E. Tangential velocity

---
**Pembahasan:**

* **Langkah Penyelesaian:**
  1. Bandingkan Hukum II Newton untuk translasi ($\sum F = m a$) dengan Hukum II Newton untuk rotasi ($\sum \tau = I \alpha$).
  2. Peran massa ($m$) sebagai ukuran hambatan terhadap percepatan linier $a$ digantikan secara persis oleh momen inersia ($I$) sebagai ukuran hambatan benda terhadap percepatan sudut $\alpha$.

* **Analisis Opsi:** A (momentum sudut) analog dengan momentum linier; B (torsi) analog dengan gaya; C (perpindahan sudut) analog dengan perpindahan linier; E (kecepatan tangensial) adalah besaran linier di tepi benda. Jawaban benar adalah D (*Moment of inertia*).

**Jawaban: D**

**Soal 20:**
Consider two uniform solid disks that have the exact same radius, but Disk 2 has three times the mass of Disk 1 ($M_{2} = 3M_{1}$). What is the ratio of the moment of inertia of Disk 2 to that of Disk 1 ($I_{2}/I_{1}$) about their central axes?

A. $1.5$
B. $3$
C. $6$
D. $9$
E. $27$

---
**Pembahasan:**

* **Diketahui:** Dua cakram pejal homogen (*uniform solid disks*), jari-jari sama ($R_{2} = R_{1} = R$), dan $M_{2} = 3M_{1}$.

* **Langkah Penyelesaian:**
  1. Momen inersia cakram pejal homogen terhadap sumbu pusatnya adalah $I = \frac{1}{2}MR^{2}$.
  2. Perhatikan bahwa $I$ berbanding linier (pangkat satu) terhadap massa $M$, dan berbanding kuadrat terhadap jari-jari $R$.
  3. Hitung rasio $I_{2}/I_{1}$:
     $$\frac{I_{2}}{I_{1}} = \frac{\frac{1}{2}M_{2}R^{2}}{\frac{1}{2}M_{1}R^{2}} = \frac{M_{2}}{M_{1}} = \frac{3M_{1}}{M_{1}} = 3$$

* **Analisis Opsi:** D ($9 = 3^{2}$) adalah jebakan utama bagi yang lupa bahwa hanya $R$ yang berpangkat dua, bukan $M$; A ($1,5$) keliru mengalikan $3$ dengan faktor $\frac{1}{2}$ dari rumus cakram padahal faktor $\frac{1}{2}$ saling habis dibagi. Jawaban benar adalah B ($3$).

**Jawaban: B**

**Soal 21:**
A rigid spinning wheel has a fixed moment of inertia. If a constant, non-zero net clockwise torque acts on the wheel, its rotational motion will exhibit...

A. constant angular acceleration.
B. constant angular velocity.
C. zero angular acceleration.
D. decreasing moment of inertia.
E. constant rotational kinetic energy.

---
**Pembahasan:**

* **Langkah Penyelesaian:**
  1. Gunakan Hukum II Newton untuk gerak rotasi:
     $$\alpha = \frac{\tau_{\text{net}}}{I}$$
  2. Karena momen inersia $I$ tetap (benda tegar) dan torsi neto $\tau_{\text{net}}$ konstan serta tidak nol, maka hasil baginya menghasilkan percepatan sudut yang konstan (dan tidak nol).

* **Analisis Opsi:** B, C, dan E hanya terjadi bila $\tau_{\text{net}} = 0$; D salah karena $I$ roda tegar bersifat tetap. Jawaban benar adalah A (*constant angular acceleration*).

**Jawaban: A**

**Soal 22:**
A thin-walled hollow hoop of mass $M$ and radius $R$ starts from rest and rolls without slipping down an inclined plane of fixed height $h$. The linear speed $v$ of the hoop at the bottom of the incline depends on...

A. the mass $M$ of the hoop only.
B. the radius $R$ of the hoop only.
C. both the mass $M$ and the radius $R$.
D. neither the mass $M$ nor the radius $R$.
E. the thickness of the incline.

---
**Pembahasan:**

* **Diketahui:** Cincin tipis berongga (*thin-walled hollow hoop*) dengan $I = MR^{2}$, mulai dari diam, menggelinding tanpa selip ($\omega = v/R$) menuruni ketinggian $h$.

* **Langkah Penyelesaian:**
  1. Karena menggelinding tanpa selip, gaya gesek statis tidak melakukan usaha disipatif sehingga berlaku kekekalan energi mekanik:
     $$Mgh = \frac{1}{2}Mv^{2} + \frac{1}{2}I\omega^{2}$$
  2. Substitusikan $I = MR^{2}$ dan $\omega = v/R$:
     $$Mgh = \frac{1}{2}Mv^{2} + \frac{1}{2}(MR^{2})\left(\frac{v}{R}\right)^{2} = \frac{1}{2}Mv^{2} + \frac{1}{2}Mv^{2} = Mv^{2}$$
  3. Sederhanakan dengan mencoret $M$ pada kedua ruas:
     $$gh = v^{2} \implies v = \sqrt{gh}$$
     Baik massa $M$ maupun jari-jari $R$ saling hilang dalam penurunan persamaan, sehingga kelajuan linier $v$ di dasar bidang miring tidak bergantung pada massa $M$ maupun jari-jari $R$.

* **Analisis Opsi:** A, B, C, dan E keliru karena $v = \sqrt{gh}$ hanya bergantung pada $g$, $h$, dan bentuk distribusi massa (koefisien momen inersia). Jawaban benar adalah D.

**Jawaban: D**

**Soal 23:**
A thin-walled hollow hoop of mass $M$ and radius $R$ starts from rest and rolls without slipping down an inclined plane of fixed height $h$. The angular speed $\omega$ of the hoop at the bottom of the incline depends on...

A. the mass $M$ of the hoop only.
B. the radius $R$ of the hoop only.
C. both the mass $M$ and the radius $R$.
D. neither the mass $M$ nor the radius $R$.
E. the mass $M$ and the total surface area of the hoop.

---
**Pembahasan:**

* **Langkah Penyelesaian:**
  1. Dari hasil Soal 22, kelajuan linier pusat massa cincin di dasar bidang miring adalah $v = \sqrt{gh}$.
  2. Hubungkan dengan kecepatan sudut menggunakan syarat tanpa selip $v = \omega R$:
     $$\omega = \frac{v}{R} = \frac{\sqrt{gh}}{R}$$
  3. Persamaan akhir tidak lagi memuat massa $M$, tetapi masih memuat jari-jari $R$ di penyebut ($\omega \propto 1/R$). Cincin yang lebih kecil jari-jarinya harus berotasi lebih cepat untuk mencapai kelajuan linier $\sqrt{gh}$ yang sama.

* **Analisis Opsi:** D adalah jebakan bagi yang langsung menyamakan jawaban dengan Soal 22 tanpa mengubah $v$ menjadi $\omega = v/R$. Jawaban benar adalah B (*the radius $R$ only*).

**Jawaban: B**

**Soal 24:**
"A net external force acting on a system of particles always produces a change in the system's total angular momentum about a chosen reference point." This statement is...

A. always true.
B. never true.
C. sometimes true, depending on where and in what direction the force is applied.
D. sometimes true, depending only on the speed of the particles.
E. always true only if the force is gravitational.

---
**Pembahasan:**

* **Langkah Penyelesaian:**
  1. Perubahan momentum sudut total terhadap titik acuan tertentu diatur oleh torsi eksternal neto terhadap titik acuan tersebut:
     $$\frac{dL}{dt} = \tau_{\text{ext}} = r \times F_{\text{ext}} \implies \vert \tau_{\text{ext}} \vert = r F_{\text{ext}} \sin\theta$$
  2. Jika garis kerja gaya tidak melewati titik acuan ($r \neq 0$ dan $\sin\theta \neq 0$), maka $\tau_{\text{ext}} \neq 0$ sehingga momentum sudut $L$ berubah.
  3. Jika gaya bekerja tepat di titik acuan atau arah garis kerjanya melewati titik acuan ($r = 0$ atau $\theta = 0^{\circ}$, $180^{\circ}$), maka $\tau_{\text{ext}} = 0$ walaupun $F_{\text{ext}} \neq 0$ sehingga $L$ tidak berubah (contoh: gaya gravitasi sentral pada orbit planet).
  4. Oleh sebab itu, pernyataan tersebut kadang-kadang benar, bergantung pada lokasi titik kerja dan arah gaya tersebut.

* **Analisis Opsi:** A mengabaikan kemungkinan torsi nol saat $r_{\perp} = 0$; B salah karena gaya yang memiliki lengan gaya jelas mengubah $L$; E justru kebalikan dari contoh gaya gravitasi sentral yang menghasilkan torsi nol terhadap pusat tarikan. Jawaban benar adalah C.

**Jawaban: C**

**Soal 25:**
The Earth orbits the Sun in an oval-shaped (elliptical) path. Assuming there is no friction in space, what happens to the Earth's angular momentum around the Sun over time?

A. It continuously increases.
B. It stays exactly the same (remains constant).
C. It continuously decreases.
D. It increases during some parts of the orbit, and decreases in others.
E. It eventually drops to zero.

---
**Pembahasan:**

* **Langkah Penyelesaian:**
  1. Gaya gravitasi Matahari pada Bumi selalu berarah radial lurus menuju pusat Matahari (gaya sentral), sehingga berlawanan arah persis dengan vektor posisi dari Matahari ke Bumi ($\theta = 180^{\circ}$).
  2. Torsi gaya gravitasi terhadap Matahari bernilai nol:
     $$\tau = r F_{g} \sin 180^{\circ} = 0 \implies \frac{dL}{dt} = 0$$
  3. Karena tidak ada gaya gesek di ruang angkasa, maka momentum sudut Bumi terhadap Matahari tetap sama persis (konstan) sepanjang waktu.

* **Analisis Opsi:** D adalah miskonsepsi umum yang tertukar antara momentum sudut $L$ (konstan) dengan kelajuan orbit $v$ (memang naik-turun sepanjang orbit elips). Jawaban benar adalah B.

**Jawaban: B**

**Soal 26:**
Mars travels around the Sun in an elliptical orbit. As Mars moves closer to the Sun toward its nearest point (perihelion), what happens to its orbital speed?

A. It decreases steadily.
B. It remains constant.
C. It increases steadily.
D. It temporarily becomes zero.
E. It decreases by half.

---
**Pembahasan:**

* **Langkah Penyelesaian (Dua Tinjauan Fisika):**
  1. **Hukum Kekekalan Momentum Sudut (Hukum II Kepler):** Karena gaya gravitasi sentral menghasilkan torsi nol, $L = m r v_{\perp} = \text{konstan}$. Ketika Mars bergerak semakin dekat ke Matahari menuju titik terdekatnya (*perihelion*), jarak $r$ mengecil secara kontinu sehingga kelajuan orbit $v$ harus meningkat secara stabil agar hasil kali $rv_{\perp}$ tetap.
  2. **Hukum Kekekalan Energi Mekanik:** Energi total $E = K + U = \frac{1}{2}mv^{2} - \frac{GMm}{r}$ konstan. Saat $r$ mengecil, energi potensial gravitasi $U$ menjadi semakin negatif (menurun), sehingga energi kinetik $K$ dan kelajuan orbit $v$ terus bertambah hingga mencapai maksimum di *perihelion*.

* **Analisis Opsi:** A terjadi saat bergerak menjauhi Matahari menuju *aphelion*; B hanya berlaku pada orbit lingkaran sempurna; D dan E bertentangan dengan mekanika orbit. Jawaban benar adalah C (*It increases steadily*).

**Jawaban: C**

**Soal 27:**
A gymnast leaps into the air while rotating in a straight, outstretched body position and then tightly tucks her knees and arms into her chest mid-air. Neglecting air resistance, what happens to her angular momentum about her center of mass?

A. It stays the same.
B. It increases significantly.
C. It decreases significantly.
D. It becomes zero during the tuck.
E. It depends on how fast she tucks her body.

---
**Pembahasan:**

* **Langkah Penyelesaian:**
  1. Saat pesenam sudah melayang di udara dengan hambatan udara diabaikan, satu-satunya gaya eksternal yang bekerja pada tubuhnya adalah gaya berat (gravitasi).
  2. Gaya berat bekerja tepat pada pusat massa pesenam, sehingga lengan gaya terhadap pusat massa sama dengan nol ($r = 0 \implies \tau_{\text{grav}} = 0$).
  3. Gaya otot yang digunakan untuk menekuk lutut dan lengan ke dada merupakan gaya internal yang tidak mengubah momentum sudut total sistem. Karena $\sum \tau_{\text{ext}} = 0$, momentum sudut terhadap pusat massa tetap sama (kekal):
     $$L_{\text{akhir}} = L_{\text{awal}} \implies I_{\text{akhir}}\omega_{\text{akhir}} = I_{\text{awal}}\omega_{\text{awal}}$$

* **Analisis Opsi:** B salah karena yang meningkat drastis adalah kecepatan sudut $\omega$ (salto berputar lebih cepat), bukan momentum sudut $L$; C, D, dan E keliru karena tidak ada torsi eksternal. Jawaban benar adalah A (*It stays the same*).

**Jawaban: A**

**Soal 28:**
When the rotating gymnast in mid-air pulls her arms and legs tightly into a tuck position (neglecting air resistance), what happens to her rotational kinetic energy?

A. It stays the same.
B. It decreases.
C. It drops to zero.
D. It converts completely into gravitational potential energy.
E. It increases.

---
**Pembahasan:**

* **Langkah Penyelesaian:**
  1. Dari Soal 27, momentum sudut pesenam tetap konstan ($L_{\text{akhir}} = L_{\text{awal}} = L$).
  2. Dari Soal 29, menarik lengan dan kaki mendekati sumbu putar memperkecil momen inersia ($I_{\text{akhir}} < I_{\text{awal}}$).
  3. Tuliskan energi kinetik rotasi dalam besaran $L$ dan $I$:
     $$K_{\text{rot}} = \frac{1}{2}I\omega^{2} = \frac{(I\omega)^{2}}{2I} = \frac{L^{2}}{2I}$$
  4. Karena pembilang $L^{2}$ konstan sedangkan penyebut $2I$ mengecil, maka nilai $K_{\text{rot}}$ meningkat ($K_{\text{rot, akhir}} > K_{\text{rot, awal}}$).
  5. **Sumber Pertambahan Energi:** Pertambahan energi kinetik rotasi ini berasal dari energi kimia tubuh pesenam; otot-ototnya melakukan usaha internal positif untuk menarik lengan dan kaki ke dalam melawan kecenderungan sentrifugal gerak putar.

* **Analisis Opsi:** A adalah miskonsepsi paling umum (mengira kekekalan $L$ berarti $K_{\text{rot}}$ juga kekal); B terjadi apabila pesenam merentangkan tubuhnya kembali keluar. Jawaban benar adalah E (*It increases*).

**Jawaban: E**

**Soal 29:**
As the rotating gymnast pulls her outstretched arms and legs tightly into a tuck position in mid-air, what happens to her moment of inertia about her spinning axis?

A. It increases.
B. It stays the same.
C. It fluctuates unpredictably.
D. It decreases.
E. It becomes equal to her mass.

---
**Pembahasan:**

* **Langkah Penyelesaian:**
  1. Momen inersia bergantung pada distribusi massa terhadap sumbu putar:
     $$I = \sum m_{i}r_{i}^{2}$$
  2. Ketika pesenam menarik lengan dan kakinya rapat ke dada (*tuck position*), massa tubuhnya tetap sama, tetapi jarak tegak lurus ($r_{i}$) bagian lengan dan tungkai terhadap sumbu rotasi berkurang secara drastis.
  3. Karena setiap kontribusi sebanding dengan $r_{i}^{2}$, maka momen inersia tubuhnya menurun secara signifikan (inilah yang memungkinkan kecepatan putar $\omega = L/I$ melonjak cepat untuk menyelesaikan salto).

* **Analisis Opsi:** A terjadi bila tubuh direntangkan lurus; B mengabaikan perubahan geometri distribusi massa; E salah secara dimensi ($I$ bersatuan $\text{kg}\cdot\text{m}^{2}$, bukan $\text{kg}$). Jawaban benar adalah D (*It decreases*).

**Jawaban: D**

**Soal 30:**
A weather satellite orbits Earth in a nearly circular path of radius $8.0 \times 10^{6}\text{ m}$, completing one full revolution every $120\text{ minutes}$. Approximately what arc length (distance along its curved path) does the satellite travel in $30\text{ minutes}$?

A. $6.3 \times 10^{6}\text{ m}$
B. $1.3 \times 10^{7}\text{ m}$
C. $2.5 \times 10^{7}\text{ m}$
D. $5.0 \times 10^{7}\text{ m}$
E. $8.0 \times 10^{7}\text{ m}$

---
**Pembahasan:**

* **Diketahui:** Jari-jari orbit $r = 8,0 \times 10^{6}\text{ m}$, periode revolusi $T = 120\text{ menit}$, selang waktu $t = 30\text{ menit}$.

* **Langkah Penyelesaian:**
  1. Hitung fraksi putaran yang ditempuh satelit selama $30\text{ menit}$:
     $$\frac{t}{T} = \frac{30\text{ menit}}{120\text{ menit}} = \frac{1}{4}\text{ putaran}$$
  2. Tentukan perpindahan sudut dalam satuan radian ($1\text{ putaran} = 2\pi\text{ rad}$):
     $$\theta = \frac{1}{4}(2\pi\text{ rad}) = \frac{\pi}{2}\text{ rad}$$
  3. Hitung panjang busur lintasan melengkung menggunakan rumus $s = r\theta$ (ekuivalen dengan seperempat keliling lingkaran $\frac{1}{4} \times 2\pi r$):
     $$s = r\theta = (8,0 \times 10^{6}\text{ m}) \times \frac{\pi}{2} = 4,0\pi \times 10^{6}\text{ m}$$
     $$s \approx 4,0 \times 3,1416 \times 10^{6}\text{ m} \approx 12,57 \times 10^{6}\text{ m} = 1,26 \times 10^{7}\text{ m} \approx 1,3 \times 10^{7}\text{ m}$$

* **Analisis Opsi:** A ($6,3 \times 10^{6}\text{ m}$) adalah seperdelapan keliling ($15\text{ menit}$); C ($2,5 \times 10^{7}\text{ m}$) adalah setengah keliling ($60\text{ menit}$); D ($5,0 \times 10^{7}\text{ m}$) adalah satu keliling penuh ($120\text{ menit}$); E ($8,0 \times 10^{7}\text{ m}$) adalah $10r$. Jawaban benar adalah B ($1,3 \times 10^{7}\text{ m}$).

**Jawaban: B**