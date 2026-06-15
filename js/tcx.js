// Export d'une séance réalisée au format TCX (Training Center XML),
// importable dans Garmin Connect (Importer des données > fichier .tcx).
// Chaque segment du WOD devient un « lap » de l'activité.

function xmlEscape(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function isoNoMs(date) {
  return new Date(date).toISOString().replace(/\.\d{3}Z$/, 'Z');
}

export function buildTcx(entry) {
  const start = new Date(entry.startedAt);
  const laps = [];
  let cursorMs = start.getTime();

  const segments = entry.segments && entry.segments.length
    ? entry.segments
    : [{ label: entry.name, kind: 'work', durationSec: entry.totalSec }];

  for (const seg of segments) {
    const lapStartMs = cursorMs;
    const lapEndMs = cursorMs + seg.durationSec * 1000;
    const lapStart = isoNoMs(new Date(lapStartMs));

    // Trackpoints horodatés : sans eux, Garmin Connect ne sait pas calculer
    // le « temps écoulé » et affiche NaN:NaN. On émet au moins un point au
    // début et à la fin du lap (un par minute pour une courbe plus propre).
    const trackpoints = [];
    const stepMs = 60 * 1000;
    for (let t = lapStartMs; t < lapEndMs; t += stepMs) {
      trackpoints.push(t);
    }
    trackpoints.push(lapEndMs);

    const track = trackpoints
      .map((t) =>
`          <Trackpoint>
            <Time>${isoNoMs(new Date(t))}</Time>
            <DistanceMeters>0.0</DistanceMeters>
          </Trackpoint>`)
      .join('\n');

    laps.push(
`      <Lap StartTime="${lapStart}">
        <TotalTimeSeconds>${seg.durationSec.toFixed(1)}</TotalTimeSeconds>
        <DistanceMeters>0.0</DistanceMeters>
        <Calories>0</Calories>
        <Intensity>${seg.kind === 'rest' ? 'Resting' : 'Active'}</Intensity>
        <TriggerMethod>Manual</TriggerMethod>
        <Notes>${xmlEscape(seg.label)}</Notes>
        <Track>
${track}
        </Track>
      </Lap>`
    );
    cursorMs = lapEndMs;
  }

  const noteParts = [entry.name];
  if (entry.rounds != null && entry.rounds > 0) noteParts.push(`Rounds : ${entry.rounds}`);
  if (entry.reps != null && entry.reps > 0) noteParts.push(`Reps : ${entry.reps}`);
  if (entry.notes) noteParts.push(entry.notes);

  return `<?xml version="1.0" encoding="UTF-8"?>
<TrainingCenterDatabase
  xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2 http://www.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd">
  <Activities>
    <Activity Sport="Other">
      <Id>${isoNoMs(start)}</Id>
${laps.join('\n')}
      <Notes>${xmlEscape(noteParts.join(' — '))}</Notes>
    </Activity>
  </Activities>
</TrainingCenterDatabase>
`;
}

export function tcxFilename(entry) {
  const date = new Date(entry.startedAt).toISOString().slice(0, 10);
  const name = entry.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'wod';
  return `${date}-${name}.tcx`;
}

// Télécharge le fichier ; sur mobile, propose le partage natif si possible
// (permet d'envoyer directement vers l'app Garmin Connect ou les fichiers).
export async function exportTcx(entry) {
  const xml = buildTcx(entry);
  const filename = tcxFilename(entry);
  const file = new File([xml], filename, { type: 'application/vnd.garmin.tcx+xml' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: entry.name });
      return 'shared';
    } catch (err) {
      if (err.name === 'AbortError') return 'cancelled';
      // sinon : repli sur le téléchargement classique
    }
  }

  const url = URL.createObjectURL(new Blob([xml], { type: 'application/octet-stream' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return 'downloaded';
}
