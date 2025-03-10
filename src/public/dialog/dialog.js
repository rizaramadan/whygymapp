function openDialog(message, code) {
    const dialog = document.getElementById('error-dialog');
    document.getElementById('error-dialog-message').textContent = message;
    document.getElementById('error-dialog-code').textContent = code;
    dialog.showModal();
}
