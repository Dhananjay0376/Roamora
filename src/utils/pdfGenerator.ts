import { jsPDF } from 'jspdf';
import { JourneyResponse, TravelParams } from '../types';
import { convertPriceString } from './currency';

/**
 * PDF Generator for full curated itineraries and travel plans.
 * Automatically wraps text, formats lists, maps local currencies, and structures multi-page content.
 */
export function generateItineraryPDF(journey: JourneyResponse, params: TravelParams): void {
  // Create an A4 document in portrait mode (210mm x 297mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2; // 174mm
  let y = margin;
  let pageNumber = 1;

  // Colors
  const primaryColor = [15, 15, 17]; // Dark charcoal (#0F0F11)
  const accentColor = [212, 175, 55]; // Elegant Gold (#D4AF37)
  const mutedColor = [100, 116, 139]; // Slate Gray (#64748B)
  const lightBgColor = [248, 250, 252]; // Soft Gray for boxes (#F8FAFC)

  // Helper: Sanitize text for standard Helvetica font rendering
  const sanitizeForPDF = (text: string): string => {
    if (!text) return '';
    return text
      .replace(/₹/g, 'INR ')
      .replace(/€/g, 'EUR ')
      .replace(/£/g, 'GBP ')
      .replace(/¥/g, 'JPY ')
      .replace(/฿/g, 'THB ')
      .replace(/C\$/g, 'CAD ')
      .replace(/A\$/g, 'AUD ')
      .replace(/Mex\$/g, 'MXN ')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2013\u2014]/g, '-')
      .replace(/[\u2022]/g, '*');
  };

  // Helper: Format price string using the custom currency converter
  const formatCost = (costStr: string) => {
    return sanitizeForPDF(convertPriceString(costStr, params.preferredCurrency || 'INR', journey.localCurrency));
  };

  // Helper: Draw header on pages after the first page
  const drawPageDecorations = (currentPage: number) => {
    if (currentPage === 1) return; // Skip cover page decoration

    // Header
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    doc.text(sanitizeForPDF(`CURATED HERITAGE EXPEDITION: ${params.destination.toUpperCase()}`), margin, 10);
    doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setLineWidth(0.2);
    doc.line(margin, 12, pageWidth - margin, 12);

    // Footer
    doc.setDrawColor(220, 220, 225);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.text(`Generative Heritage Planner | Offline Compass`, margin, pageHeight - 8);
    doc.text(`Page ${currentPage}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  };

  // Helper: Check space and add page if needed
  const ensureSpace = (heightNeeded: number) => {
    if (y + heightNeeded > pageHeight - margin - 5) {
      doc.addPage();
      pageNumber++;
      drawPageDecorations(pageNumber);
      y = margin + 5; // Reset y with offset for headers
    }
  };

  // Helper: Print wrapped paragraph
  const printParagraph = (text: string, fontSize: number = 10, fontStyle: 'normal' | 'bold' | 'italic' = 'normal', color = primaryColor) => {
    doc.setFont('Helvetica', fontStyle);
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);
    
    const lines = doc.splitTextToSize(sanitizeForPDF(text), contentWidth);
    const lineHeight = fontSize * 0.45; // mm per line approx

    lines.forEach((line: string) => {
      ensureSpace(lineHeight);
      doc.text(line, margin, y);
      y += lineHeight;
    });
    y += 2; // small padding
  };

  // Helper: Print Section Title
  const printSectionTitle = (title: string, sub: string = '') => {
    ensureSpace(22);
    y += 4;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(sanitizeForPDF(title), margin, y);
    y += 6;

    // Underline accent
    doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setLineWidth(0.8);
    doc.line(margin, y - 2, margin + 40, y - 2);

    if (sub) {
      doc.setFont('Helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
      doc.text(sanitizeForPDF(sub), margin, y);
      y += 5;
    }
    y += 2;
  };

  // ==========================================
  // PAGE 1: COVER PAGE
  // ==========================================
  
  // Background highlight box
  doc.setFillColor(lightBgColor[0], lightBgColor[1], lightBgColor[2]);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20, 'F');
  
  // Outer frame
  doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setLineWidth(0.5);
  doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

  // Accent inner frame
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.15);
  doc.rect(14, 14, pageWidth - 28, pageHeight - 28);

  y = 40;
  
  // Badge
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text('HERITAGE COMPASS EXPEDITION CURATOR', pageWidth / 2, y, { align: 'center' });
  
  // Small separator
  y += 6;
  doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setLineWidth(0.6);
  doc.line(pageWidth / 2 - 15, y, pageWidth / 2 + 15, y);
  
  // Title
  y += 25;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(sanitizeForPDF(params.destination.toUpperCase()), pageWidth / 2, y, { align: 'center' });

  // Subtitle
  y += 12;
  doc.setFont('Helvetica', 'italic');
  doc.setFontSize(13);
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  const subtitleText = `${params.duration}-Day Deep Immersion & Slow Exploration`;
  doc.text(sanitizeForPDF(subtitleText), pageWidth / 2, y, { align: 'center' });

  // Specs divider line
  y += 22;
  doc.setDrawColor(210, 210, 215);
  doc.setLineWidth(0.2);
  doc.line(margin + 10, y, pageWidth - margin - 10, y);

  // Specifications Grid
  y += 10;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);

  const specs = [
    { label: 'Travelers', value: `${params.travelers} Traveler(s)` },
    { label: 'Pacing Strategy', value: 'Slow, Sustainable, High-Authenticity' },
    { label: 'Curation Style', value: params.travelStyle.join(', ') || 'Culture & Heritage' },
    { label: 'Budget Level', value: params.budget.toUpperCase() },
    { label: 'Preferred Currency', value: params.preferredCurrency || 'INR' },
    { label: 'Age Dynamic', value: params.ageGroup }
  ];

  specs.forEach((spec, idx) => {
    const colIdx = idx % 2;
    const rowIdx = Math.floor(idx / 2);
    const colX = colIdx === 0 ? margin + 15 : pageWidth / 2 + 5;
    const rowY = y + rowIdx * 12;

    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text(sanitizeForPDF(spec.label.toUpperCase()), colX, rowY);
    
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(sanitizeForPDF(spec.value), colX, rowY + 5);
  });

  // Overview Introduction
  y += 48;
  doc.setDrawColor(210, 210, 215);
  doc.setLineWidth(0.2);
  doc.line(margin + 10, y, pageWidth - margin - 10, y);

  y += 10;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('PHILOSOPHY OVERVIEW', pageWidth / 2, y, { align: 'center' });

  y += 6;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  
  const overviewSummary = journey.summary || journey.overview;
  const wrappedOverview = doc.splitTextToSize(sanitizeForPDF(overviewSummary), contentWidth - 20);
  wrappedOverview.forEach((line: string) => {
    doc.text(line, pageWidth / 2, y, { align: 'center' });
    y += 5;
  });

  // AI Curation Score footer on cover page
  if (journey.aiTravelScore) {
    y = pageHeight - 35;
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.rect(pageWidth / 2 - 25, y, 50, 10, 'F');
    
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 15, 17);
    doc.text(sanitizeForPDF(`HERITAGE SCORE: ${journey.aiTravelScore.score}/100`), pageWidth / 2, y + 6.5, { align: 'center' });
  }

  // ==========================================
  // PAGE 2: ESSENTIAL PREPARATION & ETIQUETTE
  // ==========================================
  doc.addPage();
  pageNumber++;
  drawPageDecorations(pageNumber);
  y = margin + 10;

  printSectionTitle('Essential Preparation', 'Cultural codes, greetings, and emergency directories');

  // Local Exchange and Currency Box
  if (journey.localCurrency) {
    const exchangeHeight = 22;
    ensureSpace(exchangeHeight);
    
    doc.setFillColor(lightBgColor[0], lightBgColor[1], lightBgColor[2]);
    doc.rect(margin, y, contentWidth, exchangeHeight, 'F');
    doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setLineWidth(0.3);
    doc.rect(margin, y, contentWidth, exchangeHeight);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text('LIVE EXCHANGE RATE CONTEXT', margin + 5, y + 5);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    
    const rateString = `1 ${params.preferredCurrency || 'INR'} = ${(journey.localCurrency.rateToUSD / (params.preferredCurrency === 'USD' ? 1 : 83.5)).toFixed(3)} ${journey.localCurrency.code} (${journey.localCurrency.name})`;
    const inverseRateString = `1 ${journey.localCurrency.code} = ${( (params.preferredCurrency === 'USD' ? 1 : 83.5) / journey.localCurrency.rateToUSD).toFixed(3)} ${params.preferredCurrency || 'INR'}`;
    
    doc.text(sanitizeForPDF(rateString), margin + 5, y + 11);
    doc.setFont('Helvetica', 'bold');
    doc.text(sanitizeForPDF(inverseRateString), margin + 5, y + 17);

    y += exchangeHeight + 8;
  }

  // Greetings
  if (journey.localEtiquette.greetings && journey.localEtiquette.greetings.length > 0) {
    printParagraph('KEY LOCAL PHRASES & GREETINGS:', 10, 'bold', accentColor);
    
    journey.localEtiquette.greetings.forEach((greeting) => {
      const greetText = `• "${greeting.native}" (${greeting.transliteration}) — Meaning: "${greeting.meaning}"`;
      printParagraph(greetText, 9.5, 'normal', primaryColor);
    });
    y += 4;
  }

  // Dos and Donts
  if (journey.localEtiquette.dos && journey.localEtiquette.dos.length > 0) {
    printParagraph('CULTURAL DOS:', 10, 'bold', [34, 197, 94]); // Greenish
    journey.localEtiquette.dos.forEach((doItem) => {
      printParagraph(`[YES] ${doItem}`, 9, 'normal', primaryColor);
    });
    y += 4;
  }

  if (journey.localEtiquette.donts && journey.localEtiquette.donts.length > 0) {
    printParagraph('CULTURAL DONT\'S:', 10, 'bold', [239, 68, 68]); // Reddish
    journey.localEtiquette.donts.forEach((dontItem) => {
      printParagraph(`[NO] ${dontItem}`, 9, 'normal', primaryColor);
    });
    y += 4;
  }

  // Dress Code
  if (journey.localEtiquette.dressCode) {
    printParagraph('REVERENT DRESS CODES:', 10, 'bold', accentColor);
    printParagraph(journey.localEtiquette.dressCode, 9, 'normal', primaryColor);
    y += 4;
  }

  // Emergency Directory
  if (journey.emergencyInformation) {
    printParagraph('EMERGENCY DIRECTORY (OFFLINE COMPASS):', 10, 'bold', [220, 38, 38]);
    
    const contacts = `Police: ${journey.emergencyInformation.police} | Medical: ${journey.emergencyInformation.medical}`;
    printParagraph(contacts, 9.5, 'bold', primaryColor);
    
    if (journey.emergencyInformation.consularAdvice) {
      printParagraph(`Consular Advice: ${journey.emergencyInformation.consularAdvice}`, 9, 'normal', mutedColor);
    }

    if (journey.emergencyInformation.usefulPhrases && journey.emergencyInformation.usefulPhrases.length > 0) {
      y += 2;
      printParagraph('Key Survival Phrases:', 9, 'bold', primaryColor);
      journey.emergencyInformation.usefulPhrases.forEach((phrase) => {
        printParagraph(`• "${phrase.phrase}" translates to "${phrase.meaning}"`, 9, 'italic', primaryColor);
      });
    }
    y += 4;
  }

  // ==========================================
  // PAGE 3+: DAILY EXPEDITION ITINERARY
  // ==========================================
  printSectionTitle('Daily Expedition Itinerary', 'Deeply educational journeys paced for slow-curation travel');

  journey.itinerary.forEach((day) => {
    // Check space for Day header
    ensureSpace(30);
    
    y += 4;
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.rect(margin, y, 22, 6, 'F');
    
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(sanitizeForPDF(`DAY ${day.dayNumber}`), margin + 3, y + 4.5);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(sanitizeForPDF(day.theme), margin + 25, y + 4.5);
    
    y += 10;
    
    doc.setDrawColor(230, 230, 235);
    doc.setLineWidth(0.15);
    doc.line(margin, y - 2, pageWidth - margin, y - 2);

    day.experiences.forEach((exp, idx) => {
      // Experience Heading
      ensureSpace(20);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      
      const expTitle = `${exp.timeSlot} — ${exp.name}`;
      doc.text(sanitizeForPDF(expTitle), margin, y);
      y += 4.5;

      // Metadata line
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
      const meta = `Duration: ${exp.timeNeeded} | Est. Cost: ${formatCost(exp.cost)} | Authenticity: ${exp.authenticityScore}/10 | Crowd Rating: ${exp.crowdScore}/10`;
      doc.text(sanitizeForPDF(meta), margin, y);
      y += 4;

      // Why it matters description
      printParagraph(exp.whyItMatters, 9, 'normal', primaryColor);

      // Storytelling / Native context
      if (exp.storytelling) {
        doc.setFillColor(lightBgColor[0], lightBgColor[1], lightBgColor[2]);
        const storyLines = doc.splitTextToSize(sanitizeForPDF(`Heritage Context: ${exp.storytelling}`), contentWidth - 8);
        const storyHeight = storyLines.length * 4.5 + 4;
        
        ensureSpace(storyHeight);
        doc.rect(margin, y, contentWidth, storyHeight, 'F');
        doc.setDrawColor(220, 220, 225);
        doc.setLineWidth(0.2);
        doc.line(margin, y, margin, y + storyHeight); // vertical left rule

        let storyY = y + 4;
        doc.setFont('Helvetica', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
        storyLines.forEach((sLine: string) => {
          doc.text(sanitizeForPDF(sLine), margin + 4, storyY);
          storyY += 4.2;
        });
        y += storyHeight + 3;
      }

      // Alternative Option
      if (exp.alternative && exp.alternative.name) {
        ensureSpace(12);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.text(sanitizeForPDF(`[CONSCIOUS ALTERNATIVE] ${exp.alternative.name} (${formatCost(exp.alternative.cost)})`), margin, y);
        y += 3.5;
        
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
        const altWrapped = doc.splitTextToSize(sanitizeForPDF(exp.alternative.why), contentWidth);
        altWrapped.forEach((aLine: string) => {
          ensureSpace(4);
          doc.text(sanitizeForPDF(aLine), margin, y);
          y += 3.8;
        });
        y += 2;
      }

      y += 3; // separation between experiences
    });
    y += 4; // separation between days
  });

  // ==========================================
  // PAGE N: HERITAGE GASTRONOMY GUIDE
  // ==========================================
  printSectionTitle('Heritage Gastronomy', 'Local culinary crafts, authentic dishes, and best eateries');

  journey.mustTryFood.forEach((food) => {
    ensureSpace(35);
    
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(sanitizeForPDF(food.name), margin, y);
    
    // Category Badge
    const categoryText = food.category.toUpperCase();
    const badgeW = doc.getTextWidth(categoryText) + 4;
    doc.setFillColor(lightBgColor[0], lightBgColor[1], lightBgColor[2]);
    doc.rect(pageWidth - margin - badgeW, y - 3.5, badgeW, 5.5, 'F');
    doc.setDrawColor(210, 210, 215);
    doc.setLineWidth(0.2);
    doc.rect(pageWidth - margin - badgeW, y - 3.5, badgeW, 5.5);
    
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text(sanitizeForPDF(categoryText), pageWidth - margin - badgeW + 2, y + 0.3);

    y += 5;

    // Food Metadata
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    const costText = formatCost(food.cost);
    doc.text(sanitizeForPDF(`Where: ${food.bestPlace} | Cost: ${costText} | Dietary: ${food.dietaryNotes || 'N/A'}`), margin, y);
    y += 4.5;

    // History / Background
    printParagraph(food.history, 9, 'normal', primaryColor);

    // Ingredients
    if (food.ingredients && food.ingredients.length > 0) {
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(sanitizeForPDF(`Key ingredients: ${food.ingredients.join(', ')}`), margin, y);
      y += 4;
    }

    // Food Etiquette
    if (food.etiquette) {
      doc.setFont('Helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      const wrappedEtiquette = doc.splitTextToSize(sanitizeForPDF(`Dining respect code: ${food.etiquette}`), contentWidth);
      wrappedEtiquette.forEach((eLine: string) => {
        ensureSpace(4);
        doc.text(sanitizeForPDF(eLine), margin, y);
        y += 4;
      });
    }

    y += 5;
  });

  // ==========================================
  // PAGE N: HERITAGE ACCOMMODATIONS
  // ==========================================
  if (journey.accommodations && journey.accommodations.length > 0) {
    printSectionTitle('Heritage Accommodations', 'Conscious properties supporting neighborhood conservation');

    journey.accommodations.forEach((stay) => {
      ensureSpace(35);

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(sanitizeForPDF(stay.name), margin, y);

      // Type Badge
      const typeText = stay.type.toUpperCase();
      const badgeW = doc.getTextWidth(typeText) + 4;
      doc.setFillColor(lightBgColor[0], lightBgColor[1], lightBgColor[2]);
      doc.rect(pageWidth - margin - badgeW, y - 3.5, badgeW, 5.5, 'F');
      doc.setDrawColor(210, 210, 215);
      doc.setLineWidth(0.2);
      doc.rect(pageWidth - margin - badgeW, y - 3.5, badgeW, 5.5);
      
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text(sanitizeForPDF(typeText), pageWidth - margin - badgeW + 2, y + 0.3);

      y += 5;

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
      doc.text(sanitizeForPDF(`Location: ${stay.location} | Est. Cost: ${formatCost(stay.priceRange)}`), margin, y);
      y += 4.5;

      printParagraph(stay.description, 9, 'normal', primaryColor);

      if (stay.whyItFitsPhilosophy) {
        printParagraph(`Curation Alignment: ${stay.whyItFitsPhilosophy}`, 8.5, 'italic', mutedColor);
      }

      if (stay.sustainableFeatures && stay.sustainableFeatures.length > 0) {
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(sanitizeForPDF(`Ecological Initiatives: ${stay.sustainableFeatures.join(' • ')}`), margin, y);
        y += 4.5;
      }

      y += 4;
    });
  }

  // ==========================================
  // PAGE N: HIDDEN GEMS & MISSIONS
  // ==========================================
  if (journey.hiddenGems && journey.hiddenGems.length > 0) {
    printSectionTitle('Sacred Sights & Hidden Gems', 'Off-the-beaten-path native lore, viewpoints, and landmarks');

    journey.hiddenGems.forEach((gem) => {
      ensureSpace(28);

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text(sanitizeForPDF(gem.name), margin, y);
      y += 5;

      printParagraph(gem.story, 9, 'normal', primaryColor);
      printParagraph(`Why it matters to local history: ${gem.whyItMatters}`, 8.5, 'italic', mutedColor);
      y += 3;
    });
  }

  if (journey.culturalMissions && journey.culturalMissions.length > 0) {
    printSectionTitle('Cultural Missions', 'Active engagement challenges to build neighborhood connections');

    journey.culturalMissions.forEach((mission, idx) => {
      ensureSpace(32);

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(sanitizeForPDF(`Mission #${idx + 1}: ${mission.title}`), margin, y);
      y += 4.5;

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text(sanitizeForPDF(`REWARD BADGE: ${mission.badgeName.toUpperCase()}`), margin, y);
      y += 4;

      printParagraph(mission.description, 9, 'normal', primaryColor);
      printParagraph(`How to accomplish: ${mission.howToAccomplish}`, 8.5, 'italic', mutedColor);
      
      if (mission.culturalContext) {
        printParagraph(`Cultural backdrop: ${mission.culturalContext}`, 8, 'normal', mutedColor);
      }

      y += 3;
    });
  }

  // ==========================================
  // PAGE N: BUDGET ESTIMATES
  // ==========================================
  printSectionTitle('Financial Estimations', 'Offline category budgets, cash weights, and regional tips');

  const {
    accommodation = 0,
    food = 0,
    transport = 0,
    tickets = 0,
    shopping = 0,
    emergencyBuffer = 0,
    cheaperAlternatives = ''
  } = journey.budgetEstimate;

  const totalCostUSD = accommodation + food + transport + tickets + shopping + emergencyBuffer;
  const preferredCurrency = params.preferredCurrency || 'INR';

  const formatRawValue = (val: number) => {
    return sanitizeForPDF(convertPriceString(`$${val}`, preferredCurrency, journey.localCurrency));
  };

  const budgetGrid = [
    { label: 'Accommodation', amount: accommodation },
    { label: 'Culinary Experiences', amount: food },
    { label: 'Transportation', amount: transport },
    { label: 'Sightseeing & Tickets', amount: tickets },
    { label: 'Artisan Crafts & Shopping', amount: shopping },
    { label: 'Emergency Safety Buffer', amount: emergencyBuffer }
  ];

  ensureSpace(45);
  doc.setFillColor(lightBgColor[0], lightBgColor[1], lightBgColor[2]);
  doc.rect(margin, y, contentWidth, 12, 'F');
  
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(sanitizeForPDF('TOTAL ESTIMATED TRIP INVESTMENT'), margin + 4, y + 8);
  
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text(sanitizeForPDF(formatRawValue(totalCostUSD)), pageWidth - margin - 4, y + 8, { align: 'right' });
  
  y += 18;

  budgetGrid.forEach((item) => {
    ensureSpace(8);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(sanitizeForPDF(item.label), margin, y);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(sanitizeForPDF(formatRawValue(item.amount)), pageWidth - margin, y, { align: 'right' });

    y += 5.5;
    
    doc.setDrawColor(235, 235, 240);
    doc.setLineWidth(0.15);
    doc.line(margin, y - 1, pageWidth - margin, y - 1);
  });

  if (cheaperAlternatives) {
    y += 4;
    printParagraph('CULTURAL SAVINGS ADVICE:', 9, 'bold', accentColor);
    printParagraph(cheaperAlternatives, 8.5, 'normal', primaryColor);
  }

  // Final blessing signoff
  y += 15;
  ensureSpace(20);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text(sanitizeForPDF('WANDER RESPECTFULLY, LIVE MINDFULLY, OBSERVE REVERENTLY.'), pageWidth / 2, y, { align: 'center' });

  // Save PDF file
  const filename = `${params.destination.toLowerCase().replace(/[^a-z0-9]/g, '_')}_heritage_expedition.pdf`;
  doc.save(filename);
}
