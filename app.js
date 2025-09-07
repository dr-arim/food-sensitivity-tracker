// GitHub Pages Compatible Gut Health Tracker
console.log('Starting Gut Health Tracker...');

let tracker = {
    patient: null,
    entries: [],
    nextEntryId: 1,
    
    init: function() {
        console.log('Initializing tracker...');
        this.setupEventListeners();
        this.setupDateDefaults();
        this.loadBSFSReference();
        this.updateRangeValues();
    },
    
    setupEventListeners: function() {
        // Registration form - use direct DOM approach
        document.addEventListener('click', (e) => {
            if (e.target && e.target.textContent === 'Register Patient') {
                e.preventDefault();
                this.registerPatient();
            }
            
            if (e.target && e.target.textContent === 'Continue to Symptom Tracking') {
                e.preventDefault();
                this.processRedFlagChecklist();
            }
        });
        
        // Form submission backup
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'registration-form') {
                e.preventDefault();
                this.registerPatient();
            }
            
            if (e.target.id === 'red-flag-form') {
                e.preventDefault();
                this.processRedFlagChecklist();
            }
        });
    },
    
    registerPatient: function() {
        console.log('Register patient called');
        
        const name = document.getElementById('patient-name')?.value?.trim();
        const mobile = document.getElementById('patient-mobile')?.value?.trim();
        const email = document.getElementById('patient-email')?.value?.trim();
        
        if (!name || !mobile || !email) {
            alert('Please fill in all required fields.');
            return;
        }

        const patientId = this.generatePatientId();
        const patientIdField = document.getElementById('patient-id');
        if (patientIdField) {
            patientIdField.value = patientId;
        }

        this.patient = {
            id: patientId,
            name: name,
            mobile: mobile,
            email: email,
            registrationDate: new Date().toISOString().split('T')
        };

        alert(`Welcome to Dr Arim's Gut Reset Club!\nPatient registered successfully!\nPatient ID: ${patientId}`);

        // Show red-flag section
        const redFlagSection = document.getElementById('red-flag-section');
        if (redFlagSection) {
            redFlagSection.style.display = 'block';
        }

        // Disable registration form
        const registrationInputs = document.querySelectorAll('#registration-form input');
        registrationInputs.forEach(input => input.disabled = true);
        
        const submitBtn = document.querySelector('#registration-form button');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Patient Registered';
        }
    },
    
    processRedFlagChecklist: function() {
        console.log('Processing red-flag checklist');
        
        const form = document.getElementById('red-flag-form');
        if (!form) {
            console.error('Red-flag form not found');
            return;
        }
        
        const formData = new FormData(form);
        const responses = {
            blood: formData.get('blood'),
            swallowing: formData.get('swallowing'),
            weightloss: formData.get('weightloss'),
            choking: formData.get('choking'),
            chestpain: formData.get('chestpain')
        };

        console.log('Red-flag responses:', responses);

        const hasRedFlags = Object.values(responses).includes('yes');

        if (hasRedFlags) {
            const redFlagSection = document.getElementById('red-flag-section');
            if (redFlagSection) {
                redFlagSection.innerHTML = `
                    <div class="red-flag-warning">
                        <h2>⚠️ IMPORTANT MEDICAL ALERT</h2>
                        <p><strong>Dr Arim's Recommendation:</strong></p>
                        <p style="font-size: 1.2rem; margin: 1.5rem 0;">
                            Based on your responses, please <strong>CONSULT YOUR DOCTOR OFFLINE IMMEDIATELY</strong> before continuing with this program.
                        </p>
                        <p>Your health and safety are Dr Arim's top priority. Please seek professional medical evaluation for the symptoms you've indicated.</p>
                        <p style="margin-top: 2rem; font-size: 0.9rem; color: #7f1d1d;">
                            You can return to this tracking tool after consulting with your healthcare provider.
                        </p>
                    </div>
                `;
            }
            return;
        }

        alert("Dr Arim's screening complete! You may now proceed with the 7-day symptom tracking.");
        
        // Show tracking sections
        const sectionsToShow = ['progress-section', 'symptom-section', 'data-section', 'summary-section'];
        sectionsToShow.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.style.display = 'block';
            }
        });
        
        // Hide red-flag section
        const redFlagSection = document.getElementById('red-flag-section');
        if (redFlagSection) {
            redFlagSection.style.display = 'none';
        }
    },
    
    generatePatientId: function() {
        const prefix = 'GH';
        const timestamp = Date.now().toString().slice(-6);
        return `${prefix}${timestamp}`;
    },
    
    setupDateDefaults: function() {
        const dateInput = document.getElementById('symptom-date');
        const timeInput = document.getElementById('symptom-time');
        
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T');
        }
        if (timeInput) {
            const now = new Date();
            timeInput.value = now.toTimeString().slice(0, 5);
        }
    },
    
    updateRangeValues: function() {
        // Range value updates will be added here
    },
    
    loadBSFSReference: function() {
        // BSFS reference will be loaded here
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => tracker.init());
} else {
    tracker.init();
}

console.log('JavaScript setup complete');
