// =======================================================
// Konfigurasi & Elemen DOM
// =======================================================
const API_URL = 'http://localhost:3000/media';
const mediaTableBody = document.getElementById('mediaTableBody');
const mediaModal = new bootstrap.Modal(document.getElementById('mediaModal'));
const mediaForm = document.getElementById('mediaForm');
const mediaIdInput = document.getElementById('mediaId');
const modalTitle = document.getElementById('mediaModalLabel');
const saveButton = document.getElementById('saveButton');
const alertMessage = document.getElementById('alertMessage');

// =======================================================
// 1. READ (GET) - Mengambil Data Media
// =======================================================
async function fetchMedia() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Gagal memuat media: ' + response.statusText);
    }

    const media = await response.json();
    renderMedia(media);
  } catch (error) {
    console.error('Error fetching media:', error);
    mediaTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center text-danger">
          Gagal terhubung ke API: ${error.message}
        </td>
      </tr>`;
  }
}

// Render data ke tabel
function renderMedia(mediaList) {
  mediaTableBody.innerHTML = '';

  if (mediaList.length === 0) {
    mediaTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center">Belum ada data media.</td>
      </tr>`;
    return;
  }

  mediaList.forEach((media) => {
    const row = mediaTableBody.insertRow();
    row.insertCell().textContent = media.id_media;
    row.insertCell().textContent = media.judul;
    row.insertCell().textContent = media.tahun_rilis;
    row.insertCell().textContent = media.genre;

    const actionsCell = row.insertCell();

    // Tombol Edit
    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-sm btn-info me-2';
    editBtn.textContent = 'Edit';
    editBtn.onclick = () => prepareEdit(media.id_media, media.judul, media.tahun_rilis, media.genre);
    actionsCell.appendChild(editBtn);

    // Tombol Hapus (dummy/optional)
    // const deleteBtn = document.createElement('button');
    // deleteBtn.className = 'btn btn-sm btn-danger';
    // deleteBtn.textContent = 'Hapus';
    // deleteBtn.onclick = () => deleteMedia(media.id_media, media.judul);
    // actionsCell.appendChild(deleteBtn);
  });
}

// =======================================================
// 2. CREATE & UPDATE (POST & PUT)
// =======================================================
mediaForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = mediaIdInput.value;
  const judul = document.getElementById('judul').value;
  const tahun_rilis = document.getElementById('tahun_rilis').value;
  const genre = document.getElementById('genre').value;

  const method = id ? 'PUT' : 'POST';
  const url = id ? `${API_URL}/${id}` : API_URL;

  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ judul, tahun_rilis, genre }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Gagal menyimpan media.');
    }

    const actionText = id ? 'diperbarui' : 'ditambahkan';
    showAlert(`Media berhasil ${actionText}!`, 'success');

    mediaModal.hide();
    mediaForm.reset();
    fetchMedia(); // refresh tabel
  } catch (error) {
    console.error('Error saat menyimpan media:', error);
    showAlert(`Gagal menyimpan media: ${error.message}`, 'danger');
  }
});

// Siapkan modal untuk "Create"
function prepareCreate() {
  modalTitle.textContent = 'Tambah Media Baru';
  saveButton.textContent = 'Tambah';
  mediaIdInput.value = '';
  mediaForm.reset();
}

// Siapkan modal untuk "Edit"
function prepareEdit(id_media, judul, tahun_rilis, genre) {
  modalTitle.textContent = 'Edit Media';
  saveButton.textContent = 'Perbarui';
  mediaIdInput.value = id_media;
  document.getElementById('judul').value = judul;
  document.getElementById('tahun_rilis').value = tahun_rilis;
  document.getElementById('genre').value = genre;
  mediaModal.show();
}

// =======================================================
// 3. UTILITAS - Menampilkan Notifikasi
// =======================================================
function showAlert(message, type) {
  alertMessage.textContent = message;
  alertMessage.className = `alert alert-${type}`;
  alertMessage.classList.remove('d-none');

  // Sembunyikan alert setelah 3 detik
  setTimeout(() => {
    alertMessage.classList.add('d-none');
  }, 3000);
}

// =======================================================
// 4. Inisialisasi - Jalankan saat halaman dimuat
// =======================================================
document.addEventListener('DOMContentLoaded', fetchMedia);
