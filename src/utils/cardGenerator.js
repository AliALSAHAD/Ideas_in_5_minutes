// Studio Card PNG Generator for Ideas in 5 Minutes (1200x1200px High-Res)

export async function generateStudioCard({
  topic,
  duration,
  notes,
  lang = 'ar',
  lensName = '',
}) {
  const canvas = document.createElement('canvas');
  const width = 1200;
  const height = 1200;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const isAr = lang === 'ar';
  const fontFamily = isAr ? 'THMANYAHSANS-BLACK, sans-serif' : 'Fraunces, Georgia, serif';
  const uiFont = isAr ? 'ThmanyahSans, sans-serif' : 'Inter, -apple-system, sans-serif';

  // 1. Background - Deep photography studio black with soft specular gradient
  const bgGrad = ctx.createRadialGradient(width / 2, 200, 50, width / 2, height / 2, 800);
  bgGrad.addColorStop(0, '#16161a');
  bgGrad.addColorStop(0.5, '#0c0c0e');
  bgGrad.addColorStop(1, '#050506');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Subtle outer border & corner brackets
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.strokeRect(40, 40, width - 80, height - 80);

  // Precision corner accents (16px)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 2;
  const cLen = 20;
  const pad = 40;
  // TL
  ctx.beginPath(); ctx.moveTo(pad, pad + cLen); ctx.lineTo(pad, pad); ctx.lineTo(pad + cLen, pad); ctx.stroke();
  // TR
  ctx.beginPath(); ctx.moveTo(width - pad - cLen, pad); ctx.lineTo(width - pad, pad); ctx.lineTo(width - pad, pad + cLen); ctx.stroke();
  // BL
  ctx.beginPath(); ctx.moveTo(pad, height - pad - cLen); ctx.lineTo(pad, height - pad); ctx.lineTo(pad + cLen, height - pad); ctx.stroke();
  // BR
  ctx.beginPath(); ctx.moveTo(width - pad - cLen, height - pad); ctx.lineTo(width - pad, height - pad); ctx.lineTo(width - pad, height - pad - cLen); ctx.stroke();

  // 3. Top Specular line
  const lineGrad = ctx.createLinearGradient(width * 0.2, 0, width * 0.8, 0);
  lineGrad.addColorStop(0, 'transparent');
  lineGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.6)');
  lineGrad.addColorStop(1, 'transparent');
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width * 0.2, 40);
  ctx.lineTo(width * 0.8, 40);
  ctx.stroke();

  // 4. Header Brand
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.font = `600 16px ${uiFont}`;
  const brandTitle = isAr ? 'أفكار في 5 دقائق ✦ IDEAS IN 5 MINUTES' : 'IDEAS IN 5 MINUTES ✦ FOCUSED SESSION';
  ctx.fillText(brandTitle, width / 2, 120);

  // 5. Metadata Badges (Duration + Date + Lens)
  const metaY = 175;
  const dateStr = new Date().toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const durStr = duration < 1
    ? (isAr ? `${Math.round(duration * 60)} ثوانٍ (تجربة)` : `${Math.round(duration * 60)}s test`)
    : `${duration ?? 5} ${isAr ? 'دقائق تفكير' : 'min session'}`;
  const badgeText = lensName ? `${durStr} • ${lensName} • ${dateStr}` : `${durStr} • ${dateStr}`;

  ctx.fillStyle = '#ffffff';
  ctx.font = `500 18px ${uiFont}`;
  ctx.fillText(badgeText, width / 2, metaY);

  // 6. Topic Title (Large, prominent)
  ctx.fillStyle = '#ffffff';
  ctx.font = isAr ? `900 68px ${fontFamily}` : `300 64px ${fontFamily}`;
  ctx.direction = isAr ? 'rtl' : 'ltr';

  // Wrap text cleanly
  const maxTitleW = width - 240;
  const words = topic.split(' ');
  let line = '';
  const lines = [];
  for (let n = 0; n < words.length; n++) {
    const testLine = line + (line ? ' ' : '') + words[n];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxTitleW && n > 0) {
      lines.push(line);
      line = words[n];
    } else {
      line = testLine;
    }
  }
  lines.push(line);

  let topicStartY = notes ? 320 : 540 - (lines.length * 40);
  const lineH = isAr ? 95 : 85;
  lines.forEach((l, idx) => {
    ctx.fillText(l, width / 2, topicStartY + idx * lineH);
  });

  // 7. User Notes / Captured Quote (if any)
  if (notes && notes.trim()) {
    const quoteBoxY = topicStartY + (lines.length * lineH) + 50;
    const boxW = width - 240;
    const boxX = 120;
    const boxH = Math.min(380, height - quoteBoxY - 160);

    // Glass box for notes
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(boxX, quoteBoxY, boxW, boxH, 16);
    ctx.fill();
    ctx.stroke();

    // Notes label
    ctx.textAlign = isAr ? 'right' : 'left';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.font = `600 16px ${uiFont}`;
    const notesLabelX = isAr ? boxX + boxW - 32 : boxX + 32;
    ctx.fillText(isAr ? 'الملاحظات والخواطر:' : 'THOUGHTS & NOTES:', notesLabelX, quoteBoxY + 45);

    // Notes body
    ctx.fillStyle = '#f4f4f5';
    ctx.font = `400 24px ${uiFont}`;
    const maxNoteW = boxW - 64;
    const noteWords = notes.trim().split(/\s+/);
    let noteLine = '';
    const noteLines = [];
    for (let i = 0; i < noteWords.length; i++) {
      const test = noteLine + (noteLine ? ' ' : '') + noteWords[i];
      if (ctx.measureText(test).width > maxNoteW && i > 0) {
        noteLines.push(noteLine);
        noteLine = noteWords[i];
        if (noteLines.length >= 6) {
          noteLines[noteLines.length - 1] += '…';
          break;
        }
      } else {
        noteLine = test;
      }
    }
    if (noteLines.length < 6) noteLines.push(noteLine);

    noteLines.forEach((nl, nIdx) => {
      ctx.fillText(nl, notesLabelX, quoteBoxY + 95 + nIdx * 40);
    });
  }

  // 8. Footer Watermark
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.font = `500 14px ${uiFont}`;
  ctx.fillText('DESIGNED FOR DEEP CREATIVE SESSIONS • 5MIN.IDEAS', width / 2, height - 70);

  // 9. Export PNG
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) { resolve(false); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanName = topic.slice(0, 24).replace(/[^\w\s\u0600-\u06FF-]/g, '').trim();
      a.download = `idea-studio-${cleanName || 'card'}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      resolve(true);
    }, 'image/png');
  });
}
