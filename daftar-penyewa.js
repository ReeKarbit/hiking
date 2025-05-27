// Fungsi untuk memuat data penyewa
function muatDaftarPenyewa() {
    const tbody = document.getElementById('daftarPenyewaBody');
    const daftarPenyewa = JSON.parse(localStorage.getItem('daftarPenyewa')) || [];
    const isAdmin = localStorage.getItem('isAdminLoggedIn') === 'true';
    
    tbody.innerHTML = '';
    
    daftarPenyewa.forEach((penyewa, index) => {
        const tr = document.createElement('tr');
        
        // Format barang yang disewa
        const barangList = penyewa.items.map(item => `${item.nama} (${item.quantity})`).join(', ');
        
        // Format tanggal
        const tanggalSewa = new Date(penyewa.tanggalMulai).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${penyewa.nama}</td>
            <td>${penyewa.noKtp}</td>
            <td>${penyewa.noHp}</td>
            <td>${barangList}</td>
            <td>${tanggalSewa}</td>
            <td>${penyewa.lamaSewa} hari</td>
            <td>Rp ${penyewa.totalHarga.toLocaleString('id-ID')}</td>
            <td>
                <span class="badge ${penyewa.status === 'Aktif' ? 'bg-success' : 'bg-secondary'}">
                    ${penyewa.status}
                </span>
            </td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-sm btn-primary" onclick="lihatFotoKTP('${penyewa.id}')">
                        <i class="bi bi-image"></i>
                    </button>
                    ${isAdmin ? `
                        <button class="btn btn-sm btn-danger" onclick="hapusPenyewa('${penyewa.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

// Fungsi untuk login admin
function loginAdmin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Cek kredensial admin (username: admin, password: admin123)
    if (username === 'admin' && password === 'admin123') {
        // Set status login di localStorage
        localStorage.setItem('isAdminLoggedIn', 'true');
        
        // Tutup modal login
        const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
        modal.hide();
        
        // Ganti ikon gear menjadi logout
        const adminButton = document.getElementById('adminButton');
        adminButton.innerHTML = '<i class="bi bi-box-arrow-right fs-4"></i>';
        adminButton.setAttribute('data-bs-toggle', '');
        adminButton.onclick = logout;
        
        // Tampilkan pesan sukses
        alert('Login berhasil!');
        
        // Refresh daftar penyewa untuk menampilkan tombol hapus
        muatDaftarPenyewa();
    } else {
        alert('Username atau password salah!');
    }
}

// Fungsi untuk logout
function logout() {
    localStorage.removeItem('isAdminLoggedIn');
    location.reload();
}

// Fungsi untuk hapus penyewa
function hapusPenyewa(id) {
    if (confirm('Apakah Anda yakin ingin menghapus data penyewa ini?')) {
        let daftarPenyewa = JSON.parse(localStorage.getItem('daftarPenyewa')) || [];
        const penyewa = daftarPenyewa.find(p => p.id == id);
        
        if (penyewa) {
            // Kembalikan stok barang jika status masih aktif
            if (penyewa.status === 'Aktif') {
                let peralatan = JSON.parse(localStorage.getItem('peralatan')) || [];
                
                penyewa.items.forEach(item => {
                    const peralatanIndex = peralatan.findIndex(p => p.id === item.id);
                    if (peralatanIndex !== -1) {
                        peralatan[peralatanIndex].stok += item.quantity;
                    }
                });
                
                localStorage.setItem('peralatan', JSON.stringify(peralatan));
            }
            
            // Hapus data penyewa
            daftarPenyewa = daftarPenyewa.filter(p => p.id != id);
            localStorage.setItem('daftarPenyewa', JSON.stringify(daftarPenyewa));
            
            alert('Data penyewa berhasil dihapus');
            muatDaftarPenyewa();
        }
    }
}

// Fungsi untuk cek status login saat halaman dimuat
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
    const adminButton = document.getElementById('adminButton');
    
    if (isLoggedIn && adminButton) {
        adminButton.innerHTML = '<i class="bi bi-box-arrow-right fs-4"></i>';
        adminButton.setAttribute('data-bs-toggle', '');
        adminButton.onclick = logout;
    }
}

// Event listener untuk form login
document.getElementById('loginForm').addEventListener('submit', loginAdmin);

// Fungsi untuk melihat detail penyewa
function lihatDetail(id) {
    const daftarPenyewa = JSON.parse(localStorage.getItem('daftarPenyewa')) || [];
    const penyewa = daftarPenyewa.find(p => p.id === id);
    
    if (!penyewa) return;
    
    const detailHTML = `
        <div class="row">
            <div class="col-md-6">
                <h6 class="mb-3">Data Penyewa</h6>
                <p><strong>Nama:</strong> ${penyewa.nama}</p>
                <p><strong>No. KTP:</strong> ${penyewa.noKtp}</p>
                <p><strong>No. HP:</strong> ${penyewa.noHp}</p>
                <p><strong>Alamat:</strong> ${penyewa.alamat}</p>
            </div>
            <div class="col-md-6">
                <h6 class="mb-3">Detail Penyewaan</h6>
                <p><strong>Tanggal Mulai:</strong> ${new Date(penyewa.tanggalMulai).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })}</p>
                <p><strong>Lama Sewa:</strong> ${penyewa.lamaSewa} hari</p>
                <p><strong>Total Harga:</strong> Rp ${penyewa.totalHarga.toLocaleString('id-ID')}</p>
                <p><strong>Status:</strong> 
                    <span class="badge ${penyewa.status === 'Aktif' ? 'bg-success' : 'bg-secondary'}">
                        ${penyewa.status}
                    </span>
                </p>
            </div>
        </div>
        <div class="mt-4">
            <h6 class="mb-3">Barang yang Disewa</h6>
            <div class="table-responsive">
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>Nama Barang</th>
                            <th>Jumlah</th>
                            <th>Harga/Hari</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${penyewa.items.map(item => `
                            <tr>
                                <td>${item.nama}</td>
                                <td>${item.quantity}</td>
                                <td>Rp ${item.harga.toLocaleString('id-ID')}</td>
                                <td>Rp ${(item.harga * item.quantity * penyewa.lamaSewa).toLocaleString('id-ID')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    document.getElementById('detailPenyewa').innerHTML = detailHTML;
    new bootstrap.Modal(document.getElementById('detailModal')).show();
}

function lihatFotoKTP(id) {
    // Ambil data penyewa
    const savedPenyewa = localStorage.getItem('daftarPenyewa');
    const daftarPenyewa = savedPenyewa ? JSON.parse(savedPenyewa) : [];
    const penyewa = daftarPenyewa.find(p => p.id === parseInt(id));

    if (!penyewa || !penyewa.fotoKtp) {
        alert('Foto KTP tidak ditemukan');
        return;
    }

    // Buat modal untuk menampilkan foto
    const modalHtml = `
        <div class="modal fade" id="fotoKtpModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">Foto KTP - ${penyewa.nama}</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center">
                        <img src="${penyewa.fotoKtp}" class="img-fluid" alt="Foto KTP ${penyewa.nama}">
                    </div>
                </div>
            </div>
        </div>
    `;

    // Tambahkan modal ke body
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);

    // Tampilkan modal
    const modal = new bootstrap.Modal(document.getElementById('fotoKtpModal'));
    modal.show();

    // Hapus modal setelah ditutup
    document.getElementById('fotoKtpModal').addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modalContainer);
    });
}

// Inisialisasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    muatDaftarPenyewa();
});
