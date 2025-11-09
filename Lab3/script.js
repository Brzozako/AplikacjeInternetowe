let map;
let userMarker;
let mapImageDataUrl;
let puzzleData = [];
let correctPieces = 0;
function initMap() {
    map = L.map('map').setView([52.2297, 21.0122], 13);

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; <a href="http://www.esri.com/">Esri</a>, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 19
    }).addTo(map);

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri',
        maxZoom: 19
    }).addTo(map);
}

function requestLocationPermission() {
    if (!navigator.geolocation) {
        document.getElementById('locationInfo').innerHTML =
            '<strong>Błąd:</strong> Twoja przeglądarka nie obsługuje geolokalizacji.';
        return;
    }

    document.getElementById('locationInfo').innerHTML =
        'Proszę zezwolić na dostęp do lokalizacji...';
}
function requestNotificationPermission() {
    if (!("Notification" in window)) {
        console.log("Ta przeglądarka nie obsługuje powiadomień");
        return;
    }

    if (Notification.permission === "default") {
        Notification.requestPermission().then(permission => {
            console.log("Uprawnienia do powiadomień:", permission);
        });
    }
}
function getUserLocation() {
    if (!navigator.geolocation) {
        alert('Geolokalizacja nie jest obsługiwana przez twoją przeglądarkę');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            document.getElementById('locationInfo').innerHTML =
                `<strong>Twoja lokalizacja:</strong><br>
                Szerokość: ${lat.toFixed(6)}°<br>
                Długość: ${lon.toFixed(6)}°`;

            map.setView([lat, lon], 15);

            if (userMarker) {
                map.removeLayer(userMarker);
            }

            userMarker = L.marker([lat, lon]).addTo(map)
                .bindPopup('Twoja lokalizacja')
                .openPopup();
        },
        (error) => {
            let errorMsg = 'Nie można pobrać lokalizacji: ';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMsg += 'Odmowa dostępu do lokalizacji';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMsg += 'Lokalizacja niedostępna';
                    break;
                case error.TIMEOUT:
                    errorMsg += 'Przekroczono czas oczekiwania';
                    break;
            }
            document.getElementById('locationInfo').innerHTML =
                `<strong>Błąd:</strong> ${errorMsg}`;
        }
    );
}

function exportMap() {
    document.getElementById('locationInfo').innerHTML = 'Eksportowanie mapy...';

    const bounds = map.getBounds();
    const zoom = map.getZoom();
    const center = map.getCenter();

    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 640;
    const ctx = canvas.getContext('2d');

    const exportDiv = document.createElement('div');
    exportDiv.style.width = '640px';
    exportDiv.style.height = '640px';
    exportDiv.style.position = 'absolute';
    exportDiv.style.left = '-9999px';
    document.body.appendChild(exportDiv);

    const exportMap = L.map(exportDiv, {
        zoomControl: false,
        attributionControl: false
    }).setView(center, zoom);

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '',
        maxZoom: 19
    }).addTo(exportMap);

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        attribution: '',
        maxZoom: 19
    }).addTo(exportMap);

    setTimeout(() => {
        html2canvas(exportDiv, {
            useCORS: true,
            allowTaint: true,
            logging: false,
            width: 640,
            height: 640
        }).then(canvas => {
            mapImageDataUrl = canvas.toDataURL('image/png');

            exportMap.remove();
            document.body.removeChild(exportDiv);

            document.getElementById('locationInfo').innerHTML =
                '<strong>Sukces!</strong> Mapa została wyeksportowana. Możesz teraz rozpocząć puzzle.';

            document.getElementById('startPuzzle').disabled = false;
        }).catch(error => {
            exportMap.remove();
            document.body.removeChild(exportDiv);

            document.getElementById('locationInfo').innerHTML =
                '<strong>Błąd:</strong> Nie udało się wyeksportować mapy.';
            console.error('Błąd eksportu:', error);
        });
    }, 1000);
}


function startPuzzle() {
    if (!mapImageDataUrl) {
        alert('Najpierw wyeksportuj mapę!');
        return;
    }

    document.getElementById('puzzleContainer').classList.remove('hidden');
    document.getElementById('puzzleContainer').scrollIntoView({ behavior: 'smooth' });

    createPuzzle();
}

function createPuzzle() {
    const board = document.getElementById('puzzleBoard');
    const pieces = document.getElementById('puzzlePieces');

    board.innerHTML = '';
    pieces.innerHTML = '';
    puzzleData = [];
    correctPieces = 0;

    for (let i = 0; i < 16; i++) {
        const dropZone = document.createElement('div');
        dropZone.className = 'drop-zone';
        dropZone.dataset.position = i;

        dropZone.addEventListener('dragover', handleDragOver);
        dropZone.addEventListener('drop', handleDrop);
        dropZone.addEventListener('dragleave', handleDragLeave);

        board.appendChild(dropZone);
    }

    const positions = Array.from({length: 16}, (_, i) => i);
    shuffleArray(positions);

    positions.forEach((pos, index) => {
        const piece = document.createElement('div');
        piece.className = 'puzzle-piece';
        piece.draggable = true;
        piece.dataset.correctPosition = pos;
        piece.dataset.pieceId = index;

        const row = Math.floor(pos / 4);
        const col = pos % 4;

        piece.style.backgroundImage = `url(${mapImageDataUrl})`;
        piece.style.backgroundPosition = `-${col * 160}px -${row * 160}px`;

        piece.addEventListener('dragstart', handleDragStart);
        piece.addEventListener('dragend', handleDragEnd);

        pieces.appendChild(piece);

        puzzleData.push({
            pieceId: index,
            correctPosition: pos,
            currentPosition: null
        });
    });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

let draggedPiece = null;

function handleDragStart(e) {
    draggedPiece = e.target;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.innerHTML);
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }

    e.dataTransfer.dropEffect = 'move';
    e.target.classList.add('drag-over');

    return false;
}

function handleDragLeave(e) {
    e.target.classList.remove('drag-over');
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    e.target.classList.remove('drag-over');

    if (!draggedPiece) return false;

    const dropZone = e.target.classList.contains('drop-zone')
        ? e.target
        : e.target.closest('.drop-zone');

    if (!dropZone) return false;
    if (dropZone.classList.contains('filled')) {
        const existingPiece = dropZone.querySelector('.puzzle-piece');
        if (existingPiece) {
            const piecesContainer = document.getElementById('puzzlePieces');

            existingPiece.classList.remove('correct');
            dropZone.classList.remove('correct', 'filled');

            piecesContainer.appendChild(existingPiece);

            const existingPieceData = puzzleData.find(
                p => p.pieceId == existingPiece.dataset.pieceId
            );
            if (existingPieceData) {
                existingPieceData.currentPosition = null;
            }
        }
    }

    if (draggedPiece.parentElement.id === 'puzzlePieces') {
        draggedPiece.remove();
    } else {
        const oldDropZone = draggedPiece.parentElement;
        if (oldDropZone && oldDropZone.classList.contains('drop-zone')) {
            oldDropZone.classList.remove('filled', 'correct');
            oldDropZone.style.backgroundImage = '';
        }
    }

    dropZone.innerHTML = '';
    dropZone.appendChild(draggedPiece);
    dropZone.classList.add('filled');

    const row = Math.floor(draggedPiece.dataset.correctPosition / 4);
    const col = draggedPiece.dataset.correctPosition % 4;
    dropZone.style.backgroundImage = `url(${mapImageDataUrl})`;
    dropZone.style.backgroundPosition = `-${col * 160}px -${row * 160}px`;

    const pieceData = puzzleData.find(
        p => p.pieceId == draggedPiece.dataset.pieceId
    );
    if (pieceData) {
        pieceData.currentPosition = parseInt(dropZone.dataset.position);
    }

    checkPiecePosition(draggedPiece, dropZone);

    return false;
}

function checkPiecePosition(piece, dropZone) {
    const correctPos = parseInt(piece.dataset.correctPosition);
    const currentPos = parseInt(dropZone.dataset.position);

    if (correctPos === currentPos) {
        dropZone.classList.add('correct');
        correctPieces++;

        if (correctPieces === 16) {
            console.log("✅ Wszystkie puzzle ułożone poprawnie!");
            setTimeout(() => {
                showCompletionNotification();
            }, 500);
        }
    } else {
        dropZone.classList.remove('correct');
    }
}
function showCompletionNotification() {
    if (!("Notification" in window)) {
        alert('Gratulacje! Ułożyłeś wszystkie puzzle!');
        return;
    }

    if (Notification.permission === "granted") {
        new Notification("Puzzle Maps", {
            body: "Gratulacje! Ułożyłeś wszystkie puzzle!",
            icon: mapImageDataUrl,
            badge: mapImageDataUrl
        });
    } else {
        alert('Gratulacje! Ułożyłeś wszystkie puzzle!');
    }

    const board = document.getElementById('puzzleBoard');
    board.style.animation = 'correctPulse 1s ease';
}

document.addEventListener('DOMContentLoaded', () => {
    initMap();
    requestLocationPermission();
    requestNotificationPermission();

    document.getElementById('getLocation').addEventListener('click', getUserLocation);
    document.getElementById('exportMap').addEventListener('click', exportMap);
    document.getElementById('startPuzzle').addEventListener('click', startPuzzle);
});
