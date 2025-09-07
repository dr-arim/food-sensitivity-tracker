// Gut Health Tracking Application
class GutHealthTracker {
    constructor() {
        this.patient = null;
        this.entries = [];
        this.nextEntryId = 1;
        this.bristolStoolScale = [
            { type: 1, description: "Separate hard lumps, like nuts (difficult to pass)", category: "Constipation", color: "#8B4513" },
            { type: 2, description: "Sausage-shaped, but lumpy", category: "Constipation", color: "#A0522D" },
            { type: 3, description: "Like a sausage but with cracks on surface", category: "Normal", color: "#CD853F" },
            { type: 4, description: "Like a sausage or snake, smooth and soft", category: "Normal (Ideal)", color: "#DAA520" },
            { type: 5, description: "Soft blobs with clear cut edges", category: "Trending toward diarrhea", color: "#F4A460" },
            { type: 6, description: "Fluffy pieces with ragged edges, mushy", category: "Diarrhea", color: "#DEB887" },
            { type: 7, description: "Watery, no solid pieces, entirely liquid", category: "Diarrhea", color: "#F5DEB3" }
        ];
        
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        console.log('Initializing Gut Health Tracker...');
        this.setupEventListeners();
        this.setupDateDefaults();
        this.loadBSFSReference();
        this.updateRangeValues();
        console.log('Initialization complete');
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Registration form
        const registrationForm = document.getElementById('registration-form');
        if (registrationForm) {
            registrationForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Registration form submitted');
                this.registerPatient();
            });
        }

        // Symptom form
        const symptomForm = document.getElementById('symptom-form');
        if (symptomForm) {
            symptomForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Symptom form submitted');
                this.addSymptomEntry();
            });
        }

        // Other checkbox toggle
        const otherCheckbox = document.getElementById('other-checkbox');
        if (otherCheckbox) {
            otherCheckbox.addEventListener('change', (e) => {
                const otherGroup = document.getElementById('other-symptom-group');
                if (otherGroup) {
                    otherGroup.style.display = e.target.checked ? 'block' : 'none';
                    
                    if (!e.target.checked) {
                        const otherSymptom = document.getElementById('other-symptom');
                        if (otherSymptom) otherSymptom.value = '';
                    }
                }
            });
        }

        // Range value updates
        const stressLevel = document.getElementById('stress-level');
        if (stressLevel) {
            stressLevel.addEventListener('input', (e) => {
                const stressValue = document.getElementById('stress-value');
                if (stressValue) stressValue.textContent = e.target.value;
            });
        }

        const sleepQuality = document.getElementById('sleep-quality');
        if (sleepQuality) {
            sleepQuality.addEventListener('input', (e) => {
                const sleepValue = document.getElementById('sleep-value');
                if (sleepValue) sleepValue.textContent = e.target.value;
            });
        }

        const severityScale = document.getElementById('severity-scale');
        if (severityScale) {
            severityScale.addEventListener('input', (e) => {
                const severityValue = document.getElementById('severity-value');
                if (severityValue) severityValue.textContent = e.target.value;
            });
        }

        // BSFS modal
        const showBsfsReference = document.getElementById('show-bsfs-reference');
        if (showBsfsReference) {
            showBsfsReference.addEventListener('click', () => {
                this.showBSFSModal();
            });
        }

        const closeBsfsModal = document.getElementById('close-bsfs-modal');
        if (closeBsfsModal) {
            closeBsfsModal.addEventListener('click', () => {
                this.hideBSFSModal();
            });
        }

        // Export and clear data
        const exportCsv = document.getElementById('export-csv');
        if (exportCsv) {
            exportCsv.addEventListener('click', () => {
                this.exportToCSV();
            });
        }

        const clearData = document.getElementById('clear-data');
        if (clearData) {
            clearData.addEventListener('click', () => {
                if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
                    this.clearAllData();
                }
            });
        }

        // Filters
        const filterStartDate = document.getElementById('filter-start-date');
        if (filterStartDate) {
            filterStartDate.addEventListener('change', () => {
                this.filterEntries();
            });
        }

        const filterEndDate = document.getElementById('filter-end-date');
        if (filterEndDate) {
            filterEndDate.addEventListener('change', () => {
                this.filterEntries();
            });
        }

        const searchEntries = document.getElementById('search-entries');
        if (searchEntries) {
            searchEntries.addEventListener('input', () => {
                this.filterEntries();
            });
        }

        // Modal click outside to close
        const bsfsModal = document.getElementById('bsfs-modal');
        if (bsfsModal) {
            bsfsModal.addEventListener('click', (e) => {
                if (e.target.id === 'bsfs-modal') {
                    this.hideBSFSModal();
                }
            });
        }

        console.log('Event listeners setup complete');
    }

    setupDateDefaults() {
        const today = new Date().toISOString().split('T')[0];
        const now = new Date().toTimeString().slice(0, 5);
        
        const symptomDate = document.getElementById('symptom-date');
        const symptomTime = document.getElementById('symptom-time');
        
        if (symptomDate) symptomDate.value = today;
        if (symptomTime) symptomTime.value = now;
    }

    updateRangeValues() {
        const stressLevel = document.getElementById('stress-level');
        const stressValue = document.getElementById('stress-value');
        if (stressLevel && stressValue) {
            stressValue.textContent = stressLevel.value;
        }

        const sleepQuality = document.getElementById('sleep-quality');
        const sleepValue = document.getElementById('sleep-value');
        if (sleepQuality && sleepValue) {
            sleepValue.textContent = sleepQuality.value;
        }

        const severityScale = document.getElementById('severity-scale');
        const severityValue = document.getElementById('severity-value');
        if (severityScale && severityValue) {
            severityValue.textContent = severityScale.value;
        }
    }

    generatePatientId() {
        const timestamp = Date.now().toString().slice(-6);
        return `GH${timestamp}`;
    }

    registerPatient() {
        console.log('Registering patient...');
        
        const nameInput = document.getElementById('patient-name');
        const mobileInput = document.getElementById('patient-mobile');
        const emailInput = document.getElementById('patient-email');
        
        if (!nameInput || !mobileInput || !emailInput) {
            console.error('Registration form elements not found');
            this.showToast('Form elements not found', 'error');
            return;
        }

        const name = nameInput.value.trim();
        const mobile = mobileInput.value.trim();
        const email = emailInput.value.trim();

        console.log('Form values:', { name, mobile, email });

        if (!name || !mobile || !email) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

        // Basic email validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            this.showToast('Please enter a valid email address', 'error');
            return;
        }

        const patientId = this.generatePatientId();
        const registrationDate = new Date().toISOString().split('T')[0];

        this.patient = {
            name,
            mobile,
            email,
            patientId,
            registrationDate
        };

        console.log('Patient registered:', this.patient);

        // Update the patient ID field
        const patientIdInput = document.getElementById('patient-id');
        if (patientIdInput) {
            patientIdInput.value = patientId;
        }

        // Show success message and reveal other sections
        this.showToast(`Patient registered successfully! ID: ${patientId}`);
        this.showSections();
    }

    showSections() {
        console.log('Showing application sections...');
        
        const sections = [
            'progress-section',
            'symptom-section', 
            'data-section',
            'summary-section'
        ];

        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.style.display = 'block';
                console.log(`Showing section: ${sectionId}`);
            }
        });
        
        this.updateProgress();
        this.updateSummary();
        this.updateEntriesTable();
    }

    addSymptomEntry() {
        console.log('Adding symptom entry...');
        
        if (!this.patient) {
            this.showToast('Please register a patient first', 'error');
            return;
        }

        const formData = this.collectSymptomFormData();
        console.log('Collected form data:', formData);
        
        if (!this.validateSymptomForm(formData)) {
            return;
        }

        const entry = {
            id: this.nextEntryId++,
            patientId: this.patient.patientId,
            date: formData.date,
            time: formData.time,
            symptoms: formData.symptoms,
            bsfsScale: formData.bsfsScale,
            mealDescription: formData.mealDescription,
            mealTiming: formData.mealTiming,
            stressLevel: formData.stressLevel,
            sleepQuality: formData.sleepQuality,
            severity: formData.severity,
            additionalNotes: formData.additionalNotes,
            timestamp: new Date().toISOString()
        };

        this.entries.push(entry);
        console.log('Entry added:', entry);
        console.log('Total entries:', this.entries.length);
        
        this.clearSymptomForm();
        this.updateProgress();
        this.updateEntriesTable();
        this.updateSummary();
        this.showToast('Symptom entry logged successfully!');
    }

    collectSymptomFormData() {
        const symptoms = [];
        const symptomCheckboxes = document.querySelectorAll('input[name="symptoms"]:checked');
        
        symptomCheckboxes.forEach(checkbox => {
            if (checkbox.value === 'Other') {
                const otherValue = document.getElementById('other-symptom').value.trim();
                if (otherValue) {
                    symptoms.push(`Other: ${otherValue}`);
                }
            } else {
                symptoms.push(checkbox.value);
            }
        });

        const dateInput = document.getElementById('symptom-date');
        const timeInput = document.getElementById('symptom-time');
        const bsfsInput = document.getElementById('bsfs-scale');
        const mealDescInput = document.getElementById('meal-description');
        const mealTimingInput = document.getElementById('meal-timing');
        const stressInput = document.getElementById('stress-level');
        const sleepInput = document.getElementById('sleep-quality');
        const severityInput = document.getElementById('severity-scale');
        const notesInput = document.getElementById('additional-notes');

        return {
            date: dateInput ? dateInput.value : '',
            time: timeInput ? timeInput.value : '',
            symptoms: symptoms,
            bsfsScale: bsfsInput ? bsfsInput.value : '',
            mealDescription: mealDescInput ? mealDescInput.value.trim() : '',
            mealTiming: mealTimingInput ? mealTimingInput.value : '',
            stressLevel: stressInput ? parseInt(stressInput.value) : 5,
            sleepQuality: sleepInput ? parseInt(sleepInput.value) : 5,
            severity: severityInput ? parseInt(severityInput.value) : 5,
            additionalNotes: notesInput ? notesInput.value.trim() : ''
        };
    }

    validateSymptomForm(formData) {
        if (!formData.date || !formData.time) {
            this.showToast('Please enter date and time', 'error');
            return false;
        }

        if (formData.symptoms.length === 0) {
            this.showToast('Please select at least one symptom', 'error');
            return false;
        }

        if (!formData.bsfsScale) {
            this.showToast('Please select Bristol Stool Form Scale type', 'error');
            return false;
        }

        return true;
    }

    clearSymptomForm() {
        const form = document.getElementById('symptom-form');
        if (form) {
            form.reset();
        }
        
        const otherGroup = document.getElementById('other-symptom-group');
        if (otherGroup) {
            otherGroup.style.display = 'none';
        }
        
        this.setupDateDefaults();
        this.updateRangeValues();
    }

    updateProgress() {
        const uniqueDays = new Set(this.entries.map(entry => entry.date)).size;
        const progressPercentage = Math.min((uniqueDays / 7) * 100, 100);
        
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        if (progressFill) {
            progressFill.style.width = `${progressPercentage}%`;
        }
        
        if (progressText) {
            progressText.textContent = `Day ${uniqueDays} of 7 completed`;
        }
    }

    updateEntriesTable() {
        const tbody = document.getElementById('entries-tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';

        if (this.entries.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="empty-state"><h3>No entries yet</h3><p>Start logging your symptoms to see them here.</p></td></tr>';
            return;
        }

        const sortedEntries = [...this.entries].sort((a, b) => {
            const dateTimeA = new Date(`${a.date} ${a.time}`);
            const dateTimeB = new Date(`${b.date} ${b.time}`);
            return dateTimeB - dateTimeA;
        });

        sortedEntries.forEach(entry => {
            const row = this.createEntryRow(entry);
            tbody.appendChild(row);
        });
    }

    createEntryRow(entry) {
        const row = document.createElement('tr');
        
        const bsfsInfo = this.bristolStoolScale.find(item => item.type == entry.bsfsScale);
        
        row.innerHTML = `
            <td>${this.formatDate(entry.date)}</td>
            <td>${entry.time}</td>
            <td>
                <div class="symptom-tags">
                    ${entry.symptoms.map(symptom => `<span class="symptom-tag">${symptom}</span>`).join('')}
                </div>
            </td>
            <td>Type ${entry.bsfsScale} - ${bsfsInfo ? bsfsInfo.category : 'Unknown'}</td>
            <td><span class="severity-badge ${this.getSeverityClass(entry.severity)}">${entry.severity}</span></td>
            <td>${entry.stressLevel}/10</td>
            <td>${entry.sleepQuality}/10</td>
            <td>
                <button class="action-btn" onclick="gutTracker.viewEntry(${entry.id})" title="View Details">👁️</button>
                <button class="action-btn delete" onclick="gutTracker.deleteEntry(${entry.id})" title="Delete">🗑️</button>
            </td>
        `;
        
        return row;
    }

    getSeverityClass(severity) {
        if (severity <= 3) return 'severity-low';
        if (severity <= 5) return 'severity-mild';
        if (severity <= 7) return 'severity-moderate';
        return 'severity-severe';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    }

    viewEntry(entryId) {
        const entry = this.entries.find(e => e.id === entryId);
        if (!entry) return;

        const bsfsInfo = this.bristolStoolScale.find(item => item.type == entry.bsfsScale);
        
        const details = `
Entry Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Date & Time: ${this.formatDate(entry.date)} at ${entry.time}

Symptoms: ${entry.symptoms.join(', ')}

Bristol Stool Form Scale: Type ${entry.bsfsScale} - ${bsfsInfo ? bsfsInfo.description : 'Unknown'}

Meal Information:
${entry.mealDescription ? `What: ${entry.mealDescription}` : 'No meal details provided'}
${entry.mealTiming ? `Timing: ${entry.mealTiming}` : 'No timing specified'}

Severity: ${entry.severity}/10
Stress Level: ${entry.stressLevel}/10
Sleep Quality: ${entry.sleepQuality}/10

${entry.additionalNotes ? `Additional Notes: ${entry.additionalNotes}` : 'No additional notes'}
        `;
        
        alert(details.trim());
    }

    deleteEntry(entryId) {
        if (confirm('Are you sure you want to delete this entry?')) {
            this.entries = this.entries.filter(e => e.id !== entryId);
            this.updateProgress();
            this.updateEntriesTable();
            this.updateSummary();
            this.showToast('Entry deleted successfully');
        }
    }

    filterEntries() {
        const startDateInput = document.getElementById('filter-start-date');
        const endDateInput = document.getElementById('filter-end-date');
        const searchInput = document.getElementById('search-entries');

        const startDate = startDateInput ? startDateInput.value : '';
        const endDate = endDateInput ? endDateInput.value : '';
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

        let filteredEntries = [...this.entries];

        if (startDate) {
            filteredEntries = filteredEntries.filter(entry => entry.date >= startDate);
        }

        if (endDate) {
            filteredEntries = filteredEntries.filter(entry => entry.date <= endDate);
        }

        if (searchTerm) {
            filteredEntries = filteredEntries.filter(entry => {
                return entry.symptoms.some(symptom => symptom.toLowerCase().includes(searchTerm)) ||
                       entry.additionalNotes.toLowerCase().includes(searchTerm) ||
                       entry.mealDescription.toLowerCase().includes(searchTerm);
            });
        }

        this.displayFilteredEntries(filteredEntries);
    }

    displayFilteredEntries(entries) {
        const tbody = document.getElementById('entries-tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';

        if (entries.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="empty-state"><h3>No matching entries</h3><p>Try adjusting your filters.</p></td></tr>';
            return;
        }

        const sortedEntries = [...entries].sort((a, b) => {
            const dateTimeA = new Date(`${a.date} ${a.time}`);
            const dateTimeB = new Date(`${b.date} ${b.time}`);
            return dateTimeB - dateTimeA;
        });

        sortedEntries.forEach(entry => {
            const row = this.createEntryRow(entry);
            tbody.appendChild(row);
        });
    }

    updateSummary() {
        const statsGrid = document.getElementById('stats-grid');
        if (!statsGrid) return;
        
        if (this.entries.length === 0) {
            statsGrid.innerHTML = '<div class="empty-state"><h3>No data to summarize</h3><p>Log some symptoms to see statistics.</p></div>';
            return;
        }

        const stats = this.calculateStatistics();
        
        statsGrid.innerHTML = `
            <div class="stat-card">
                <span class="stat-value">${this.entries.length}</span>
                <p class="stat-label">Total Entries</p>
            </div>
            <div class="stat-card">
                <span class="stat-value">${stats.avgSeverity}</span>
                <p class="stat-label">Average Severity</p>
            </div>
            <div class="stat-card">
                <span class="stat-value">${stats.mostCommonSymptom}</span>
                <p class="stat-label">Most Common Symptom</p>
            </div>
            <div class="stat-card">
                <span class="stat-value">${stats.uniqueDays}</span>
                <p class="stat-label">Days Tracked</p>
            </div>
            <div class="stat-card">
                <span class="stat-value">${stats.avgStress}</span>
                <p class="stat-label">Average Stress</p>
            </div>
            <div class="stat-card">
                <span class="stat-value">${stats.avgSleep}</span>
                <p class="stat-label">Average Sleep Quality</p>
            </div>
        `;
    }

    calculateStatistics() {
        const avgSeverity = (this.entries.reduce((sum, entry) => sum + entry.severity, 0) / this.entries.length).toFixed(1);
        const avgStress = (this.entries.reduce((sum, entry) => sum + entry.stressLevel, 0) / this.entries.length).toFixed(1);
        const avgSleep = (this.entries.reduce((sum, entry) => sum + entry.sleepQuality, 0) / this.entries.length).toFixed(1);
        
        const symptomCounts = {};
        this.entries.forEach(entry => {
            entry.symptoms.forEach(symptom => {
                symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
            });
        });
        
        const mostCommonSymptom = Object.keys(symptomCounts).reduce((a, b) => 
            symptomCounts[a] > symptomCounts[b] ? a : b, 'None'
        );
        
        const uniqueDays = new Set(this.entries.map(entry => entry.date)).size;

        return {
            avgSeverity,
            avgStress,
            avgSleep,
            mostCommonSymptom,
            uniqueDays
        };
    }

    exportToCSV() {
        if (this.entries.length === 0) {
            this.showToast('No data to export', 'error');
            return;
        }

        const headers = [
            'Patient ID', 'Patient Name', 'Date', 'Time', 'Symptoms', 
            'BSFS Scale', 'BSFS Description', 'Meal Description', 'Meal Timing',
            'Stress Level', 'Sleep Quality', 'Severity', 'Additional Notes', 'Entry Timestamp'
        ];

        const csvData = this.entries.map(entry => {
            const bsfsInfo = this.bristolStoolScale.find(item => item.type == entry.bsfsScale);
            return [
                this.patient.patientId,
                this.patient.name,
                entry.date,
                entry.time,
                `"${entry.symptoms.join(', ')}"`,
                entry.bsfsScale,
                `"${bsfsInfo ? bsfsInfo.description : 'Unknown'}"`,
                `"${entry.mealDescription}"`,
                entry.mealTiming,
                entry.stressLevel,
                entry.sleepQuality,
                entry.severity,
                `"${entry.additionalNotes}"`,
                entry.timestamp
            ].join(',');
        });

        const csvContent = [headers.join(','), ...csvData].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `gut-health-journal-${this.patient.patientId}-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showToast('Data exported successfully!');
    }

    clearAllData() {
        this.entries = [];
        this.nextEntryId = 1;
        this.updateProgress();
        this.updateEntriesTable();
        this.updateSummary();
        this.showToast('All data cleared successfully');
    }

    loadBSFSReference() {
        const referenceContainer = document.getElementById('bsfs-reference');
        if (!referenceContainer) return;
        
        referenceContainer.innerHTML = this.bristolStoolScale.map(item => `
            <div class="bsfs-item">
                <div class="bsfs-icon" style="background-color: ${item.color}"></div>
                <div class="bsfs-details">
                    <h4>Type ${item.type}</h4>
                    <p>${item.description}</p>
                    <span class="bsfs-category ${item.category.toLowerCase().includes('constipation') ? 'constipation' : 
                        item.category.toLowerCase().includes('normal') ? 'normal' : 'diarrhea'}">${item.category}</span>
                </div>
            </div>
        `).join('');
    }

    showBSFSModal() {
        const modal = document.getElementById('bsfs-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    hideBSFSModal() {
        const modal = document.getElementById('bsfs-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('success-toast');
        const messageElement = document.getElementById('toast-message');
        
        if (!toast || !messageElement) return;
        
        messageElement.textContent = message;
        
        if (type === 'error') {
            toast.style.backgroundColor = 'var(--color-error)';
        } else {
            toast.style.backgroundColor = 'var(--color-success)';
        }
        
        toast.classList.remove('hidden');
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 300);
        }, 3000);
    }
}

// Initialize the application when the page loads
let gutTracker;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        gutTracker = new GutHealthTracker();
        window.gutTracker = gutTracker;
    });
} else {
    gutTracker = new GutHealthTracker();
    window.gutTracker = gutTracker;
}