import random
from collections import Counter


def generate_ranked_ballots(candidates, voters):
    ballots = []

    for _ in range(voters):
        ranking = candidates.copy()
        random.shuffle(ranking)
        ballots.append(ranking)

    return ballots


def calculate_fptp(ballots, candidates):
    first_choices = []

    for ballot in ballots:
        if ballot:
            first_choices.append(ballot[0])

    vote_count = Counter(first_choices)
    votes = {candidate: vote_count.get(candidate, 0) for candidate in candidates}
    winner = max(votes, key=votes.get)

    return winner, votes


def calculate_ranked_choice(ballots, candidates):
    active_candidates = candidates.copy()
    round_history = []

    while len(active_candidates) > 1:
        round_votes = {candidate: 0 for candidate in active_candidates}

        for ballot in ballots:
            for choice in ballot:
                if choice in active_candidates:
                    round_votes[choice] += 1
                    break

        total_active_votes = sum(round_votes.values())

        round_history.append({
            "round": len(round_history) + 1,
            "votes": round_votes.copy()
        })

        for candidate, votes in round_votes.items():
            if votes > total_active_votes / 2:
                return candidate, round_votes, round_history

        lowest_candidate = min(round_votes, key=round_votes.get)
        active_candidates.remove(lowest_candidate)

    final_winner = active_candidates[0]

    final_votes = {candidate: 0 for candidate in active_candidates}
    for ballot in ballots:
        for choice in ballot:
            if choice in active_candidates:
                final_votes[choice] += 1
                break

    round_history.append({
        "round": len(round_history) + 1,
        "votes": final_votes.copy()
    })

    return final_winner, final_votes, round_history


def calculate_proportional(ballots, candidates):
    first_choices = []

    for ballot in ballots:
        if ballot:
            first_choices.append(ballot[0])

    vote_count = Counter(first_choices)
    votes = {candidate: vote_count.get(candidate, 0) for candidate in candidates}
    top_candidate = max(votes, key=votes.get)

    return top_candidate, votes


def format_vote_data(votes, total_voters):
    vote_data = []

    for candidate, count in votes.items():
        percent = round((count / total_voters) * 100, 1) if total_voters else 0
        vote_data.append({
            "name": candidate,
            "votes": count,
            "percent": percent
        })

    vote_data.sort(key=lambda x: x["votes"], reverse=True)
    return vote_data


def simulate_election(candidates, voters, system="fptp"):
    candidates = [candidate.strip() for candidate in candidates if candidate.strip()]
    voters = int(voters)

    if len(candidates) < 2:
        return {"error": "At least 2 candidates are required."}

    if voters < 10:
        return {"error": "At least 10 voters are required."}

    ballots = generate_ranked_ballots(candidates, voters)

    fptp_winner, fptp_votes = calculate_fptp(ballots, candidates)
    ranked_winner, ranked_votes, round_history = calculate_ranked_choice(ballots, candidates)
    proportional_top, proportional_votes = calculate_proportional(ballots, candidates)

    if system == "fptp":
        selected_winner = fptp_winner
        selected_votes = fptp_votes
        system_title = "First-Past-The-Post"
        explanation = (
            f"Candidate {selected_winner} won because they received the highest number "
            "of first-choice votes. In FPTP, the candidate with the most votes wins, "
            "even if they do not receive more than 50%."
        )

    elif system == "ranked":
        selected_winner = ranked_winner
        selected_votes = ranked_votes
        system_title = "Ranked Choice Voting"
        explanation = (
            f"Candidate {selected_winner} won using Ranked Choice Voting. "
            "The lowest candidate was eliminated round by round, and votes were transferred "
            "to the next preferred active candidate until a winner was found."
        )

    elif system == "proportional":
        selected_winner = proportional_top
        selected_votes = proportional_votes
        system_title = "Proportional Representation"
        explanation = (
            "In Proportional Representation, the focus is not only on one winner. "
            "Representation is distributed based on vote share. The top vote-getter is shown, "
            f"but all candidates receive influence according to their percentage of votes."
        )

    else:
        selected_winner = fptp_winner
        selected_votes = fptp_votes
        system_title = "First-Past-The-Post"
        explanation = "Unknown system selected, so FPTP was used by default."

    vote_data = format_vote_data(selected_votes, voters)

    comparison = {
        "fptp": {
            "title": "FPTP",
            "winner": fptp_winner,
            "votes": format_vote_data(fptp_votes, voters)
        },
        "ranked": {
            "title": "Ranked Choice",
            "winner": ranked_winner,
            "votes": format_vote_data(ranked_votes, voters),
            "roundHistory": round_history
        },
        "proportional": {
            "title": "Proportional",
            "winner": proportional_top,
            "votes": format_vote_data(proportional_votes, voters)
        }
    }

    return {
        "voteData": vote_data,
        "winner": selected_winner,
        "totalVotes": voters,
        "turnout": round(random.uniform(65, 92), 1),
        "system": system_title,
        "roundHistory": round_history if system == "ranked" else [],
        "comparison": comparison,
        "explanation": explanation
    }