let started = false;
let start_btn = document.getElementById('start_btn');
let metronome_bpm_input = document.getElementById('metronome-bpm');
let harmonic_field_input = document.getElementById('harmonic-field');
let harmonic_bpm_input = document.getElementById('harmonic-bpm');
let sequential_chords_input = document.getElementById('sequential-chords');
let basic_mode_input = document.getElementById('basic-mode');
let play_metronome_sound_input = document.getElementById('play-metronome-sound');
let instrument_input = document.getElementById('instrument');


start_btn.addEventListener('click', () => {
    if(!started) {
        start_btn.innerHTML = 'Parar';
        start_btn.style.backgroundColor = '#ff0000';
        start_btn.style.borderColor = '#ff0000';
        harmonicFields('play');
    } else {
        start_btn.innerHTML = 'Iniciar';
        start_btn.style.backgroundColor = '#50c019';
        start_btn.style.borderColor = '#50c019';
        harmonicFields('stop');
    }
    started = !started;
});

function showData(data){
    // Campos de dados
    let field = document.getElementById('field');
    let field_chords = document.getElementById('field-chords');
    let instrument_data = document.getElementById('instrument_data');
    let chords_notes = document.getElementById('chords-notes');
    let chord_example_image = document.getElementById('chord-example-image');

    field.innerHTML = data.field+ " - " + data.name;
    field_chords.innerHTML = data.chord;
    instrument_data.innerHTML = data.instrument_name;
    if(data.notes.length > 0) {
        chords_notes.innerHTML = data.notes.join(', ');
        chord_example_image.src = 'assets/images/chords/'+ data.instrument +'/'+ data.image + '.jpeg';
    } else {
        chords_notes.innerHTML = '';
        chord_example_image.src = '';
    }
}

function showPreData(data){
    let field = document.getElementById('field');
    let field_chords = document.getElementById('field-chords');
    let instrument_data = document.getElementById('instrument_data');
    let chords_notes = document.getElementById('chords-notes');
    let chord_example_image = document.getElementById('chord-example-image');

    field.innerHTML = data.title;
    field_chords.innerHTML = data.count;
    instrument_data.innerHTML = "";
    chords_notes.innerHTML = "";
    chord_example_image.src = "";
}

function showHiddenFields(basic_mode){
    let chords_notes = document.getElementById('chords-notes');
    let chord_example_image = document.getElementById('chord-example-image');

    if(basic_mode == 'false') {
        chords_notes.style.display = 'none';
        chord_example_image.style.display = 'none';
    } else {
        chords_notes.style.display = 'revert';
        chord_example_image.style.display = 'revert';
    }
}

// Aplicação

let metronome = new Audio('assets/sounds/metronome.wav');
let metronome_beat;
let harmonic_beat;

function harmonicFields(action) {
    let harmonic_field = harmonic_field_input.value;
    let metronome_bpm  = metronome_bpm_input.value;
    let harmonic_bpm   = harmonic_bpm_input.value;
    let sequential_chords = sequential_chords_input.value;
    let basic_mode = basic_mode_input.value;
    let play_metronome_sound = play_metronome_sound_input.checked;
    let instrument = instrument_input.value;

    showHiddenFields(basic_mode);

    if(action == 'play') {
        showPreData({
            title: "Prepare-se! Já vamos começar...",
            count: "1"
        });

        fetch("assets/data/harmonic_fields.json").then(response => {
            return response.json();
        }).then(function(data){
            data.map(function(field) {
                if(field.field == harmonic_field && field.instrument == instrument) {
                    if(play_metronome_sound) {
                        let count = 1;
                        metronome_beat = setInterval(function() {
                            metronome.play();

                            if(count < harmonic_bpm) {
                                showPreData({
                                    title: "Prepare-se! Já vamos começar...",
                                    count: count+1
                                });
                            }
                            count++;
                        } , 60000 / metronome_bpm);
                    }

                    let seq = 0;
                    lastChord = 0;
                    harmonic_beat = setInterval(function() {
                        if(seq == field.chords.length) {
                            seq = 0;
                        }
                        
                        let chord = field.chords[seq];
                        if(sequential_chords == 'false') {
                            chord = field.chords[Math.floor(Math.random() * field.chords.length)];
                            while(chord == lastChord) {
                                chord = field.chords[Math.floor(Math.random() * field.chords.length)];
                            }
                            lastChord = chord;
                        }

                        fetch("assets/data/"+instrument+"/chords_notes.json").then(response => {
                            return response.json();
                        }).then(function(chords){
                            chords.map(function(chord_notes) {
                                if(chord_notes.chord == chord) {
                                    notes = [];
                                    image = '';
                                    if(basic_mode == 'true') {
                                        notes = chord_notes.notes;
                                        image = chord_notes.image;
                                    }
                                    let data = {
                                        field: field.field,
                                        name: field.name,
                                        instrument: field.instrument,
                                        instrument_name: field.instrument_name,
                                        chord: chord,
                                        notes: notes,
                                        image: image
                                    }
                                    
                                    showData(data);
                                }
                            });
                        });
                        seq++;
                    } , (harmonic_bpm * (60000 / metronome_bpm)));
                }
            });
        });    
    }

    if(action == 'stop') {
        clearInterval(metronome_beat);
        clearInterval(harmonic_beat);
        metronome.pause();
    }
}