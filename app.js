gsap.registerPlugin(Draggable);

const record = document.getElementById('crate-record');
const platter = document.getElementById('platter');
const tonearm = document.getElementById('tonearm');
const audio = document.getElementById('song');
const overlay = document.getElementById('letter-overlay');
const vinylImage = document.querySelector('.vinyl');

let isPlaying = false;
let isRecordOnPlatter = false;

// Floating Antigravity Animations (Yoyo)
// Turntable floats slowly
gsap.to("#float-turntable", {
  y: "-=18",
  rotation: 1,
  duration: 4.2,
  ease: "sine.inOut",
  yoyo: true,
  repeat: -1
});

// Polaroid floats independently out of sync
gsap.to("#float-polaroid", {
  y: "+=22",
  rotation: -2,
  duration: 5.1,
  ease: "sine.inOut",
  yoyo: true,
  repeat: -1,
  delay: 0.8
});

// The record wrapper floats independently in the crate
const floatRecordAnim = gsap.to("#float-record", {
  y: "-=25",
  rotation: 4,
  duration: 4.6,
  ease: "sine.inOut",
  yoyo: true,
  repeat: -1,
  delay: 0.3
});

// Make Record Draggable
Draggable.create(record, {
  type: "x,y",
  edgeResistance: 0.65,
  bounds: ".environment",
  onDragStart: function() {
    // Bring aggressively to front to avoid getting stuck behind polaroid
    gsap.set(record, { zIndex: 1000 });
    
    // Pause floating while holding to prevent jitter
    floatRecordAnim.pause();
    
    // Scale up slightly to signify pickup
    gsap.to(record, { scale: 1.1, duration: 0.2, ease: "power2.out" });
  },
  onRelease: function() {
    // Check if dropped near the platter (over 30% overlap)
    if (this.hitTest(platter, "30%")) {
      // Snap logic
      const platterRect = platter.getBoundingClientRect();
      const recordRect = record.getBoundingClientRect();
      
      const dx = platterRect.left - recordRect.left;
      const dy = platterRect.top - recordRect.top;

      gsap.to(record, {
        x: this.x + dx + (platterRect.width - recordRect.width) / 2,
        y: this.y + dy + (platterRect.height - recordRect.height) / 2,
        scale: 1, // Return to normal size
        duration: 0.7,
        ease: "power3.out",
        onComplete: () => {
          isRecordOnPlatter = true;
          // Pop it securely onto platter
          gsap.timeline()
            .to(record, { scale: 1.05, duration: 0.1 })
            .to(record, { scale: 1, duration: 0.2 })
            .call(() => {
               // Auto play directly when it drops perfectly
               playMusic();
            });
        }
      });
    } else {
      // Failed to drop on platter, return to floating crate zone
      isRecordOnPlatter = false;
      gsap.to(record, { 
        x: 0, 
        y: 0, 
        scale: 1,
        duration: 0.9, 
        ease: "back.out(1.5)",
        onComplete: () => { 
          gsap.set(record, { zIndex: 2 }); // Slide neatly back behind polaroid
          floatRecordAnim.play(); // Resume zero-gravity floating
        }
      });
      if (isPlaying) {
         stopMusic();
      }
    }
  }
});

function playMusic() {
  if (isPlaying) return;
  isPlaying = true;
  
  // Start record spinning
  vinylImage.classList.add('spin');
  
  // Visually pivot the tonearm seamlessly over the record automatically
  tonearm.classList.add('playing');
  
  // Play audio
  audio.play().catch(e => console.warn("Audio play blocked initially. Update src with an mp3."));

  // Ethereal reveal of the love letter
  setTimeout(() => {
    if (isPlaying) { // Extra check in case they swiftly yanked the record away
       overlay.classList.add('reveal');
       
       // Smooth initial float-in
       gsap.to("#float-letter", {
         y: 0, 
         duration: 3, 
         ease: "power2.out"
       });

       // Begin endless drift in space for the letter
       gsap.to("#float-letter", {
          y: "+=20",
          duration: 4,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 3
       });
    }
  }, 3000);
}

function stopMusic() {
  isPlaying = false;
  vinylImage.classList.remove('spin');
  tonearm.classList.remove('playing');
  audio.pause();
  overlay.classList.remove('reveal');
}
