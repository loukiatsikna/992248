$("document").ready(function () {
  var currentQuestion = 0;
  var totalQuestions = 0;
  var all_questions;
  var all_questions_en;
  var all_evidences;
  var all_evidences_en;
  var faq;
  var faq_en;
  var selectedRadioButtonIndex = -1; // <-- ΝΕΟ: κρατά τον index της τρέχουσας επιλογής (0-based)

  //hide the form buttons when its necessary
  function hideFormBtns() {
    $("#nextQuestion").hide();
    $("#backButton").hide();
  }

  //Once the form begins, the questions' data and length are fetched.
  function getQuestions() {
    return fetch("question-utils/all-questions.json")
      .then((response) => response.json())
      .then((data) => {
        all_questions = data;
        totalQuestions = data.length;

        return fetch("question-utils/all-questions-en.json")
          .then((response) => response.json())
          .then((dataEn) => {
            all_questions_en = dataEn;
          })
          .catch((error) => {
            console.error("Failed to fetch all-questions-en.json:", error);
            const errorMessage = document.createElement("div");
            errorMessage.textContent = "Error: Failed to fetch all-questions-en.json.";
            $(".question-container").html(errorMessage);
            hideFormBtns();
          });
      })
      .catch((error) => {
        console.error("Failed to fetch all-questions:", error);
        const errorMessage = document.createElement("div");
        errorMessage.textContent = "Error: Failed to fetch all-questions.json.";
        $(".question-container").html(errorMessage);
        hideFormBtns();
      });
  }

  //Once the form begins, the evidences' data and length are fetched.
  function getEvidences() {
    return fetch("question-utils/cpsv.json")
      .then((response) => response.json())
      .then((data) => {
        all_evidences = data;

        return fetch("question-utils/cpsv-en.json")
          .then((response) => response.json())
          .then((dataEn) => {
            all_evidences_en = dataEn;
          })
          .catch((error) => {
            console.error("Failed to fetch cpsv-en:", error);
            const errorMessage = document.createElement("div");
            errorMessage.textContent = "Error: Failed to fetch cpsv-en.json.";
            $(".question-container").html(errorMessage);
            hideFormBtns();
          });
      })
      .catch((error) => {
        console.error("Failed to fetch cpsv:", error);
        const errorMessage = document.createElement("div");
        errorMessage.textContent = "Error: Failed to fetch cpsv.json.";
        $(".question-container").html(errorMessage);
        hideFormBtns();
      });
  }

  //Once the form begins, the faqs' data is fetched.
  function getFaq() {
    return fetch("question-utils/faq.json")
      .then((response) => response.json())
      .then((data) => {
        faq = data;
        return fetch("question-utils/faq-en.json")
          .then((response) => response.json())
          .then((dataEn) => {
            faq_en = dataEn;
          })
          .catch((error) => {
            console.error("Failed to fetch faq-en:", error);
            const errorMessage = document.createElement("div");
            errorMessage.textContent = "Error: Failed to fetch faq-en.json.";
            $(".question-container").html(errorMessage);
          });
      })
      .catch((error) => {
        console.error("Failed to fetch faq:", error);
        const errorMessage = document.createElement("div");
        errorMessage.textContent = "Error: Failed to fetch faq.json.";
        $(".question-container").html(errorMessage);
      });
  }

  function getEvidencesById(id) {
    var selectedEvidence =
      (currentLanguage === "greek" ? all_evidences : all_evidences_en)
        .PublicService.evidence.find((e) => e.id === id);

    if (selectedEvidence) {
      const evidenceListElement = document.getElementById("evidences");
      selectedEvidence.evs.forEach((evsItem) => {
        const listItem = document.createElement("li");
        listItem.textContent = evsItem.name;
        evidenceListElement.appendChild(listItem);
      });
    } else {
      console.log(`Evidence with ID '${id}' not found.`);
    }
  }

  //text added in the final result
  function setResult(text) {
    const resultWrapper = document.getElementById("resultWrapper");
    const result = document.createElement("h5");
    result.textContent = text;
    resultWrapper.appendChild(result);
  }

  function loadFaqs() {
    var faqData = currentLanguage === "greek" ? faq : faq_en;
    var faqTitle = currentLanguage === "greek" ? "Συχνές Ερωτήσεις" : "Frequently Asked Questions";
    var faqElement = document.createElement("div");

    faqElement.innerHTML = `
      <div class="govgr-heading-m language-component" data-component="faq" tabIndex="15">
        ${faqTitle}
      </div>
    `;

    var ft = 16;
    faqData.forEach((faqItem) => {
      var faqSection = document.createElement("details");
      faqSection.className = "govgr-accordion__section";
      faqSection.tabIndex = ft;

      faqSection.innerHTML = `
        <summary class="govgr-accordion__section-summary">
          <h2 class="govgr-accordion__section-heading">
            <span class="govgr-accordion__section-button">
              ${faqItem.question}
            </span>
          </h2>
        </summary>
        <div class="govgr-accordion__section-content">
          <p class="govgr-body">
            ${convertURLsToLinks(faqItem.answer)}
          </p>
        </div>
      `;
      faqElement.appendChild(faqSection);
      ft++;
    });

    $(".faqContainer").html(faqElement);
  }

  // get the url from faqs and link it
  function convertURLsToLinks(text) {
    return text.replace(
      /https:\/\/www\.gov\.gr\/[\S]+/g,
      '<a href="$&" target="_blank">myKEPlive</a>.'
    );
  }

  // Load a question (renders radios, wires listeners, etc.)
  function loadQuestion(questionId, noError) {
    $("#nextQuestion").show();
    if (currentQuestion > 0) $("#backButton").show();

    var question = (currentLanguage === "greek" ? all_questions : all_questions_en)[questionId];
    var questionElement = document.createElement("div");

    const radiosHTML = question.options.map((option, index) => `
      <div class='govgr-radios__item'>
        <label class='govgr-label govgr-radios__label'>
          ${option}
          <input class='govgr-radios__input' type='radio' name='question-option' value='${option}' data-index='${index}' />
        </label>
      </div>
    `).join("");

    if (noError) {
      questionElement.innerHTML = `
        <div class='govgr-field'>
          <fieldset class='govgr-fieldset' aria-describedby='radio-country'>
            <legend role='heading' aria-level='1' class='govgr-fieldset__legend govgr-heading-l'>
              ${question.question}
            </legend>
            <div class='govgr-radios' id='radios-${questionId}'>
              <ul>${radiosHTML}</ul>
            </div>
          </fieldset>
        </div>
      `;
    } else {
      questionElement.innerHTML = `
        <div class='govgr-field govgr-field__error' id='$id-error'>
          <legend role='heading' aria-level='1' class='govgr-fieldset__legend govgr-heading-l'>
            ${question.question}
          </legend>
          <fieldset class='govgr-fieldset' aria-describedby='radio-error'>
            <legend class='govgr-fieldset__legend govgr-heading-m language-component' data-component='chooseAnswer'>
              Επιλέξτε την απάντησή σας
            </legend>
            <p class='govgr-hint language-component' data-component='oneAnswer'>Μπορείτε να επιλέξετε μόνο μία επιλογή.</p>
            <div class='govgr-radios' id='radios-${questionId}'>
              <p class='govgr-error-message'>
                <span class='govgr-visually-hidden language-component' data-component='errorAn'>Λάθος:</span>
                <span class='language-component' data-component='choose'>Πρέπει να επιλέξετε μια απάντηση</span>
              </p>
              ${radiosHTML}
            </div>
          </fieldset>
        </div>
      `;

      if (currentLanguage === "english") {
        var components = Array.from(questionElement.querySelectorAll(".language-component"));
        components.slice(-4).forEach(function (component) {
          var componentName = component.dataset.component;
          component.textContent = languageContent[currentLanguage][componentName];
        });
      }
    }

    $(".question-container").html(questionElement);

    // --- ΝΕΟ: wire up radios ώστε να ενημερώνεται ο selectedRadioButtonIndex ---
    selectedRadioButtonIndex = -1;
    $("input.govgr-radios__input[name='question-option']").off("change").on("change", function () {
      selectedRadioButtonIndex = Number($(this).data("index")); // 0-based
    });

    // Αν υπάρχει απάντηση στο sessionStorage (π.χ. μετά από Back), προ-επέλεξέ την
    
    
  }

  function skipToEnd(message) {
    const errorEnd = document.createElement("h5");
    const error =
      currentLanguage === "greek"
        ? "Λυπούμαστε, αλλά δεν δικαιούστε το Στεγαστικό Επίδομα Φοιτητών!"
        : "We are sorry, but you are not eligible for the Student Housing Allowance!";
    errorEnd.className = "govgr-error-summary";
    errorEnd.textContent = error + " " + (message || "");
    $(".question-container").html(errorEnd);
    hideFormBtns();
  }

  $("#startBtn").click(function () {
    $("#intro").html("");
    $("#languageBtn").hide();
    $("#questions-btns").show();
  });

  function retrieveAnswers() {
    var allAnswers = [];
    for (var i = 0; i < totalQuestions; i++) {
      var ans = sessionStorage.getItem("answer_" + i);
      allAnswers.push(ans ? String(ans).trim() : "");
    }

      // --- Αν στην ερώτηση 2 επιλέχθηκε 1 ή 2 -> άμεση επιτυχία ---
  if (allAnswers[2] === "1" || allAnswers[2] === "2") {
    currentLanguage === "greek"
      ? setResult("Ναι — δικαιούστε το Στεγαστικό Επίδομα Φοιτητών.")
      : setResult("Yes — you are eligible for the Student Housing Allowance.");

    // Εμφάνιση δικαιολογητικών
    getEvidencesById(1);
    getEvidencesById(2);
    getEvidencesById(3);
    getEvidencesById(4);
    return; // σταμάτα εδώ — δεν χρειάζεται να συνεχίσει η υπόλοιπη συνάρτηση
  }
// --- Κανόνας A: Αν Q2 = "3" (άνω των 25) -> στην Q6 επιτρέπεται μόνο "1"
if (allAnswers[2] === "3" && allAnswers[6] && allAnswers[6] !== "1") {
  return skipToEnd(
    currentLanguage === "greek"
      ? "Εφόσον είστε άνω των 25 ετών, η μίσθωση πρέπει να είναι στο όνομά σας."
      : "Since you are over 25, the lease must be in your (the student's) name."
  );
}

// --- Κανόνας B: Αν Q2 = "3" και Q6 = "1" -> στην Q7 επιτρέπεται μόνο "2"
if (allAnswers[2] === "3" && allAnswers[6] === "1" && allAnswers[7] && allAnswers[7] !== "2") {
  return skipToEnd(
    currentLanguage === "greek"
      ? "Εφόσον είστε άνω των 25 ετών και η μίσθωση είναι στο όνομά σας, πρέπει να έχει υποβληθεί φορολογική δήλωση από εσάς."
      : "Since you are over 25 and the lease is in your name, the tax return must be filed by you."
  );
}


    const yes = (i) => allAnswers[i] === "1";
    const no  = (i) => allAnswers[i] === "2";

    if (no(0)) return skipToEnd(currentLanguage === "greek"
      ? "Το επίδομα χορηγείται σε Έλληνες/πολίτες ΕΕ με νόμιμη διαμονή στην Ελλάδα."
      : "The allowance is for Greek/EU citizens lawfully residing in Greece.");

    if (no(1)) return skipToEnd(currentLanguage === "greek"
      ? "Πρέπει να είστε φοιτητής ή γονέας φοιτητή με ακαδημαϊκή ταυτότητα σε ισχύ."
      : "You must be a student or a student's parent with a valid academic ID.");

    if (no(3)) return skipToEnd(currentLanguage === "greek"
      ? "Το οικογενειακό εισόδημα υπερβαίνει τα προβλεπόμενα όρια."
      : "Household income exceeds the permitted thresholds.");

    if (no(4)) return skipToEnd(currentLanguage === "greek"
      ? "Απαιτείται μίσθωση σε ισχύ για τουλάχιστον 6 μήνες."
      : "An active rental agreement for at least 6 months is required.");

    if (no(5)) return skipToEnd(currentLanguage === "greek"
      ? "Πρέπει να διαμένετε σε μισθωμένη κατοικία λόγω σπουδών σε διαφορετική πόλη, χωρίς πλήρη κυριότητα/επικαρπία."
      : "You must reside in rented housing for studies in a different city, with no full ownership/usufruct.");

    if (!(allAnswers[6] === "1" || allAnswers[6] === "2"))
      return skipToEnd(currentLanguage === "greek"
        ? "Η μίσθωση πρέπει να είναι στο όνομα του φοιτητή ή του γονέα που τον/την βαρύνει."
        : "The lease must be in the student's name or in the name of the parent who claims the student.");

    if (allAnswers[7] === "4" || allAnswers[7] === "")
      return skipToEnd(currentLanguage === "greek"
        ? "Πρέπει να έχει υποβληθεί φορολογική δήλωση για το τελευταίο οικονομικό έτος."
        : "A tax return must have been filed for the last fiscal year.");

    if (allAnswers[8] === "3" || allAnswers[8] === "")
      return skipToEnd(currentLanguage === "greek"
        ? "Δεν πληρούνται τα περιουσιακά κριτήρια (όριο 200 τ.μ.)."
        : "Property criteria are not met (200 m² limit).");

    if (no(9)) return skipToEnd(currentLanguage === "greek"
      ? "Απαιτείται επιτυχία τουλάχιστον στο 50% των μαθημάτων του προηγούμενου ακαδημαϊκού έτους."
      : "You must have passed at least 50% of last year's courses.");

    currentLanguage === "greek"
      ? setResult("Ναι — δικαιούστε το Στεγαστικό Επίδομα Φοιτητών.")
      : setResult("Yes — you are eligible for the Student Housing Allowance.");

    getEvidencesById(1);
    getEvidencesById(2);
    getEvidencesById(3);
    getEvidencesById(4);
  }

  function grantImmediately() {
  // Τίτλος
  const resultWrapper = document.createElement("div");
  const titleText = currentLanguage === "greek"
    ? "Είστε δικαιούχος!"
    : "You are eligible!";
  resultWrapper.innerHTML = `<h1 class='answer'>${titleText}</h1>`;
  resultWrapper.setAttribute("id", "resultWrapper");
  $(".question-container").html(resultWrapper);

  // Λίστα δικαιολογητικών
  const evidenceListElement = document.createElement("ol");
  evidenceListElement.setAttribute("id", "evidences");

  // Κείμενο περιγραφής
  const descText = currentLanguage === "greek"
    ? "Τα δικαιολογητικά που πρέπει να προσκομίσετε για το Στεγαστικό Επίδομα είναι τα εξής:"
    : "The documents required for the Student Housing Allowance are:";
  $(".question-container").append(`<br /><br /><h5 class='answer'>${descText}</h5><br />`);
  $(".question-container").append(evidenceListElement);

  // Εμφάνιση δικαιολογητικών 1–4 από το cpsv.json
  getEvidencesById(1);
  getEvidencesById(2);
  getEvidencesById(3);
  getEvidencesById(4);

  hideFormBtns();
}


  function submitForm() {
    const resultWrapper = document.createElement("div");
    const titleText = currentLanguage === "greek" ? "Είστε δικαιούχος!" : "You are eligible!";
    resultWrapper.innerHTML = `<h1 class='answer'>${titleText}</h1>`;
    resultWrapper.setAttribute("id", "resultWrapper");
    $(".question-container").html(resultWrapper);

    const evidenceListElement = document.createElement("ol");
    evidenceListElement.setAttribute("id", "evidences");

    if (currentLanguage === "greek") {
      $(".question-container").append("<br /><br /><h5 class='answer'>Τα δικαιολογητικά που πρέπει να προσκομίσετε για το Στεγαστικό Επίδομα είναι τα εξής:</h5><br />");
    } else {
      $(".question-container").append("<br /><br /><h5 class='answer'>The documents required for the Student Housing Allowance are:</h5><br />");
    }

    $(".question-container").append(evidenceListElement);
    $("#faqContainer").load("faq.html");
    retrieveAnswers();
    hideFormBtns();
  }

  // ---------- NEXT (με early checks & αποθήκευση) ----------
  $("#nextQuestion").off("click").on("click", function (e) {
    e.preventDefault();

    // --- Έλεγχος: αν δεν έχει επιλεγεί απάντηση, δείξε μήνυμα λάθους στη φόρμα ---
    if ($("input.govgr-radios__input[name='question-option']:checked").length === 0) {
  loadQuestion(currentQuestion, false); // ξαναφόρτωσε με κόκκινο error μήνυμα
  const err = document.querySelector(".govgr-field__error .govgr-error-message");
  if (err) err.scrollIntoView({ behavior: "smooth", block: "center" });
  return; // σταμάτα εδώ
}


    if (selectedRadioButtonIndex === -1) {
      alert(currentLanguage === "greek" ? "Επίλεξε μια απάντηση." : "Please select an answer.");
      return;
    }

    const choice = String(selectedRadioButtonIndex + 1);
    const msg = (gr, en) => (currentLanguage === "greek" ? gr : en);

    switch (currentQuestion) {
      case 0:
        if (choice === "2") return skipToEnd(msg(
          "Το επίδομα χορηγείται σε Έλληνες/πολίτες ΕΕ με νόμιμη διαμονή.",
          "The allowance is for Greek/EU citizens lawfully residing in Greece."
        ));
        break;
      case 1:
        if (choice === "2") return skipToEnd(msg(
          "Πρέπει να είστε φοιτητής ή γονέας φοιτητή με ακαδημαϊκή ταυτότητα σε ισχύ.",
          "You must be a student or a student's parent with a valid academic ID."
        ));
        break;
      case 2:
  // Αν επιλέχθηκε 1 ή 2 -> άμεση επιτυχία
  if (choice === "1" || choice === "2") {
    // αποθήκευσε και τερμάτισε με δικαιούχος
    sessionStorage.setItem("answer_" + currentQuestion, choice);
    grantImmediately();
    return;
  }
  // για τις επιλογές 3 ή 4, προχώρα κανονικά
  break;

      case 3:
        if (choice === "2") return skipToEnd(msg(
          "Το οικογενειακό εισόδημα υπερβαίνει τα προβλεπόμενα όρια.",
          "Household income exceeds the permitted thresholds."
        ));
        break;
      case 4:
        if (choice === "2") return skipToEnd(msg(
          "Απαιτείται μίσθωση σε ισχύ για τουλάχιστον 6 μήνες.",
          "An active rental agreement for at least 6 months is required."
        ));
        break;
      case 5:
        if (choice === "2") return skipToEnd(msg(
          "Πρέπει να διαμένετε σε μισθωμένη κατοικία λόγω σπουδών σε διαφορετική πόλη, χωρίς πλήρη κυριότητα/επικαρπία.",
          "You must reside in rented housing for studies in a different city, with no full ownership/usufruct."
        ));
        break;
      case 6: {
  // Q6: Σε ποιο όνομα είναι καταχωρημένη η μίσθωση;
  const q2 = sessionStorage.getItem("answer_2"); // τι απάντησε στην ερώτηση 2

  if (q2 === "3") {
    // Αν είναι "Φοιτητής άνω των 25 ετών"
    if (choice !== "1") {
      return skipToEnd(
        currentLanguage === "greek"
          ? "Εφόσον είστε άνω των 25 ετών, η μίσθωση πρέπει να είναι στο όνομά σας."
          : "Since you are over 25, the lease must be in your (the student's) name."
      );
    }
  } else {
    // Αν δεν είναι άνω των 25 -> κανονικός έλεγχος (επιτρέπεται 1 ή 2)
    if (!(choice === "1" || choice === "2")) {
      return skipToEnd(
        currentLanguage === "greek"
          ? "Η μίσθωση πρέπει να είναι στο όνομα του φοιτητή ή του γονέα που τον/την βαρύνει."
          : "The lease must be in the student's name or the parent who claims the student."
      );
    }
  }
  break;
}

      case 7: {
  // Q7: Φορολογική δήλωση προηγούμενου οικονομικού έτους
  const q2 = sessionStorage.getItem("answer_2");
  const q6 = sessionStorage.getItem("answer_6");

  if (q2 === "3" && q6 === "1") {
    // Αν είναι άνω των 25 και η μίσθωση στο όνομά του
    if (choice !== "2") {
      return skipToEnd(
        currentLanguage === "greek"
          ? "Εφόσον είστε άνω των 25 ετών και η μίσθωση είναι στο όνομά σας, πρέπει να έχει υποβληθεί φορολογική δήλωση από εσάς."
          : "Since you are over 25 and the lease is in your name, the tax return must be filed by you."
      );
    }
  } else {
    // Κανονική ροή: μη δεκτή μόνο η 3η επιλογή ("Δεν υποβλήθηκε")
    if (choice === "3") {
      return skipToEnd(
        currentLanguage === "greek"
          ? "Πρέπει να έχει υποβληθεί φορολογική δήλωση για το τελευταίο οικονομικό έτος."
          : "A tax return must have been filed for the last fiscal year."
      );
    }
  }
  break;
}

      case 8:
        if (choice === "3") return skipToEnd(msg(
          "Δεν πληρούνται τα περιουσιακά κριτήρια (όριο 200 τ.μ.).",
          "Property criteria are not met (200 m² limit)."
        ));
        break;
      case 9:
        if (choice === "2") return skipToEnd(msg(
          "Απαιτείται επιτυχία τουλάχιστον στο 50% των μαθημάτων του προηγούμενου ακαδημαϊκού έτους.",
          "You must have passed at least 50% of last year's courses."
        ));
        break;
    }

    // Save answer & advance
    sessionStorage.setItem("answer_" + currentQuestion, choice);

    if (currentQuestion >= totalQuestions - 1) {
      submitForm();
      return;
    }

    currentQuestion++;
    selectedRadioButtonIndex = -1;
    loadQuestion(currentQuestion, true);
  });

  // ---------- BACK ----------
  $("#backButton").click(function () {
    if (currentQuestion > 0) {
      currentQuestion--;
      loadQuestion(currentQuestion, true);

      // φέρε αποθηκευμένη απάντηση (1-based)
      var saved = sessionStorage.getItem("answer_" + currentQuestion);
      if (saved) {
        var idx = Number(saved) - 1; // 0-based
        const $toCheck = $(`input.govgr-radios__input[name='question-option'][data-index='${idx}']`);
        if ($toCheck.length) {
          $toCheck.prop("checked", true);
          selectedRadioButtonIndex = idx;
        }
      }
    }
  });

  $("#languageBtn").click(function () {
    toggleLanguage();
    loadFaqs();
    if (currentQuestion >= 0 && currentQuestion < totalQuestions)
      loadQuestion(currentQuestion, true);
  });

  $("#questions-btns").hide();

  // Load everything then first question
  getQuestions().then(() => {
    getEvidences().then(() => {
      getFaq().then(() => {
        loadFaqs();
        $("#faqContainer").show();
        loadQuestion(currentQuestion, true);
      });
    });
  });
});