const STATUS_LABELS = ["Filed", "Pending", "Under Process", "Resolved"];

export default function ComplaintTable({
	complaints = [],
	editable = false,
	onStatusChange,
	compact = false,
	emptyMessage = "No complaints available.",
}) {
	if (complaints.length === 0) {
		return (
			<div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-panel-soft)] px-6 py-12 text-center text-sm text-[var(--admin-muted)]">
				{emptyMessage}
			</div>
		);
	}

	return (
		<div className="overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-panel-soft)]">
			<div className="overflow-x-auto">
				<table className="min-w-full divide-y divide-[var(--admin-border)] text-left text-sm">
					<thead className="bg-black/10 text-[var(--admin-muted)] uppercase tracking-[0.18em]">
						<tr>
							<th className="px-5 py-4 font-medium">S.No</th>
							<th className="px-5 py-4 font-medium">Title</th>
							<th className={`px-5 py-4 font-medium ${compact ? "hidden md:table-cell" : ""}`}>
								Description
							</th>
							<th className="px-5 py-4 font-medium">Category</th>
							<th className="px-5 py-4 font-medium">Date & Time</th>
							<th className="px-5 py-4 font-medium">Status</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-[var(--admin-border)] text-[var(--admin-text)]">
						{complaints.map((complaint, index) => {
							const currentStatus = complaint.status || STATUS_LABELS[0];
							const currentStatusIndex = STATUS_LABELS.indexOf(currentStatus);
							const allowedStatuses = STATUS_LABELS.slice(currentStatusIndex === -1 ? 0 : currentStatusIndex);

							return (
								<tr key={complaint.id} className="align-top transition hover:bg-white/[0.03]">
									<td className="px-5 py-4 font-medium text-[var(--admin-muted)]">{index + 1}</td>
									<td className="px-5 py-4">
										<div className="font-medium">{complaint.title}</div>
										{complaint.image ? (
											<img
												src={`/api/uploads/${complaint.image}`}
												alt={complaint.title}
												className="mt-3 h-14 w-20 rounded-md border border-[var(--admin-border)] object-cover shadow-sm"
											/>
										) : null}
										<div className="mt-3 flex flex-wrap gap-2">
											{complaint.sentiment && (
												<span className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${
													complaint.sentiment === 'Positive' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
													complaint.sentiment === 'Negative' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
													'bg-slate-500/10 text-slate-400 border border-slate-500/20'
												}`}>
													{complaint.sentiment} Tone
												</span>
											)}
											{complaint.is_duplicate && (
												<span className="inline-flex items-center whitespace-nowrap rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400 border border-amber-500/20">
													⚠️ Duplicate ({Math.round(complaint.duplicate_confidence * 100)}%)
												</span>
											)}
										</div>
									</td>
									<td className={`px-5 py-4 text-[var(--admin-muted)] ${compact ? "hidden md:table-cell" : ""}`}>
										{complaint.description}
									</td>
									<td className="px-5 py-4 text-[var(--admin-muted)]">{complaint.category || "General"}</td>
									<td className="px-5 py-4 text-[var(--admin-muted)]">
										{complaint.createdAt ? new Date(complaint.createdAt).toLocaleString() : "Unknown"}
									</td>
									<td className="px-5 py-4">
										{editable ? (
											<select
												value={currentStatus}
												onChange={(event) => onStatusChange?.(complaint.id, event.target.value)}
												className="w-full rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--admin-text)] outline-none transition focus:border-sky-400/50"
											>
												{allowedStatuses.map((status) => (
													<option key={status} value={status}>
														{status}
													</option>
												))}
											</select>
										) : (
											<span
												className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
													currentStatus === "Resolved"
														? "bg-emerald-500/15 text-emerald-300"
														: currentStatus === "Under Process"
															? "bg-amber-500/15 text-amber-300"
															: "bg-slate-500/15 text-slate-300"
												}`}
											>
												{currentStatus}
											</span>
										)}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
}