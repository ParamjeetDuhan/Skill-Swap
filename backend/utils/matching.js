// Matching algorithm
//
// For a given user, we look at every other user and compute a two-way
// compatibility score:
//   - "theyTeachMeMatches": skills in THEIR "skillsToTeach" that overlap
//      with MY "skillsToLearn"
//   - "iTeachThemMatches": skills in MY "skillsToTeach" that overlap
//      with THEIR "skillsToLearn"
//
// Compatibility % = (overlapping skill count in both directions) /
//                    (total unique skills considered across both lists) * 100
//
// This rewards users who can both teach each other something (a true swap)
// but still surfaces one-directional matches with a lower score.

function normalizeName(name) {
  return name.trim().toLowerCase();
}

function computeMatch(currentUser, otherUser) {
  const myTeachNames = new Set(currentUser.skillsToTeach.map((s) => normalizeName(s.name)));
  const myLearnNames = new Set(currentUser.skillsToLearn.map((s) => normalizeName(s.name)));
  const theirTeachNames = new Set(otherUser.skillsToTeach.map((s) => normalizeName(s.name)));
  const theirLearnNames = new Set(otherUser.skillsToLearn.map((s) => normalizeName(s.name)));

  // Skills they can teach that I want to learn
  const theyTeachMeMatches = otherUser.skillsToTeach.filter((s) =>
    myLearnNames.has(normalizeName(s.name))
  );

  // Skills I can teach that they want to learn
  const iTeachThemMatches = currentUser.skillsToTeach.filter((s) =>
    theirLearnNames.has(normalizeName(s.name))
  );

  const totalOverlap = theyTeachMeMatches.length + iTeachThemMatches.length;

  // Denominator: total distinct "interest slots" being considered (my learn list + their learn list)
  const totalPossible = myLearnNames.size + theirLearnNames.size;

  let score = 0;
  if (totalPossible > 0) {
    score = Math.round((totalOverlap / totalPossible) * 100);
  }

  // Bonus: two-way swaps (both can teach each other something) are ranked higher
  const isTwoWay = theyTeachMeMatches.length > 0 && iTeachThemMatches.length > 0;
  if (isTwoWay) {
    score = Math.min(100, score + 15);
  }

  return {
    userId: otherUser._id,
    name: otherUser.name,
    profilePic: otherUser.profilePic,
    avgRating: otherUser.avgRating,
    bio: otherUser.bio,
    compatibility: score,
    isTwoWay,
    theyCanTeachYou: theyTeachMeMatches.map((s) => ({ name: s.name, category: s.category })),
    youCanTeachThem: iTeachThemMatches.map((s) => ({ name: s.name, category: s.category })),
  };
}

// Returns a ranked list of matches (highest compatibility first), excluding
// users with 0% compatibility.
function findMatches(currentUser, allOtherUsers) {
  const matches = allOtherUsers
    .map((other) => computeMatch(currentUser, other))
    .filter((m) => m.compatibility > 0)
    .sort((a, b) => b.compatibility - a.compatibility);

  return matches;
}

module.exports = { computeMatch, findMatches };
