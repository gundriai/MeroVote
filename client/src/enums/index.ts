export enum PollVoteStatusMessages {
    ALREADY_VOTED = 'Already Voted',
    POLL_NOT_ACTIVE = 'Poll is not active',
    POLL_OPTION_NOT_FOUND = 'Poll option not found',
    USER_NOT_LOGGED_IN = 'User must be logged in to vote',
    POLL_NOT_FOUND = 'Poll not found',
    VOTE_FAILED = 'Failed to vote on poll',
    INVALID_POLL_DATA = 'Invalid poll data',
    VOTING_ENDED = 'Voting has ended for this poll'
}