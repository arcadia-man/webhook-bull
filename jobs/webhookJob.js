module.exports = async function webhookJobProcessor(job) {
    const { event, payload } = job.data;

    console.log(`🔄 Processing event: ${event}`);
    console.log(`📦 Repo: ${payload.repository?.full_name}`);
    console.log(`👤 Pusher: ${payload.pusher?.name}`);
    console.log(`📝 Commit: ${payload.head_commit?.message}`);
    // You can also save to DB or call another API here

    return Promise.resolve();
};