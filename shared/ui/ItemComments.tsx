"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@shared/ui/ToastProvider";
import type { CommentView } from "@repositories/CommentRepository";
import type { Result } from "@shared/types/Result";

type CommentReasonOption = { value: string; label: string };

type ItemCommentsProps = {
  itemId: string;
  currentUserId?: string | null;
  locale: string;
  comments: CommentView[];
  reasonOptions: CommentReasonOption[];
  labels: {
    title: string;
    empty: string;
    addPlaceholder: string;
    addButton: string;
    replyButton: string;
    editButton: string;
    deleteButton: string;
    reportButton: string;
    saveButton: string;
    cancelButton: string;
    deletedLabel: string;
    hiddenLabel: string;
    reportReasonLabel: string;
    reportMemoLabel: string;
    reportSubmitLabel: string;
  };
  onCreate: (formData: FormData) => Promise<Result>;
  onReply: (formData: FormData) => Promise<Result>;
  onUpdate: (formData: FormData) => Promise<Result>;
  onDelete: (formData: FormData) => Promise<Result>;
  onReport: (formData: FormData) => Promise<Result>;
};

const formatDate = (date: Date, locale: string) =>
  new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);

export function ItemComments({
  itemId,
  currentUserId,
  locale,
  comments,
  reasonOptions,
  labels,
  onCreate,
  onReply,
  onUpdate,
  onDelete,
  onReport
}: ItemCommentsProps) {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [newBody, setNewBody] = useState("");
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [activeEditId, setActiveEditId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportMemo, setReportMemo] = useState("");

  const { parents, repliesByParent } = useMemo(() => {
    const parents = comments
      .filter((comment) => !comment.parentId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const repliesByParent = new Map<string, CommentView[]>();
    comments
      .filter((comment) => comment.parentId)
      .forEach((comment) => {
        const key = comment.parentId as string;
        const list = repliesByParent.get(key) ?? [];
        list.push(comment);
        repliesByParent.set(key, list);
      });
    repliesByParent.forEach((list, key) => {
      list.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      repliesByParent.set(key, list);
    });
    return { parents, repliesByParent };
  }, [comments]);

  const run = (action: (formData: FormData) => Promise<Result>, formData: FormData) => {
    startTransition(async () => {
      const result = await action(formData);
      if (result.ok) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  const submitNew = () => {
    if (!currentUserId) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    const formData = new FormData();
    formData.set("itemId", itemId);
    formData.set("body", newBody);
    run(onCreate, formData);
    setNewBody("");
  };

  const submitReply = (parentId: string) => {
    if (!currentUserId) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    const formData = new FormData();
    formData.set("itemId", itemId);
    formData.set("parentId", parentId);
    formData.set("body", replyBody);
    run(onReply, formData);
    setReplyBody("");
    setActiveReplyId(null);
  };

  const submitEdit = (commentId: string) => {
    const formData = new FormData();
    formData.set("commentId", commentId);
    formData.set("body", editBody);
    run(onUpdate, formData);
    setEditBody("");
    setActiveEditId(null);
  };

  const submitDelete = (commentId: string) => {
    const formData = new FormData();
    formData.set("commentId", commentId);
    run(onDelete, formData);
  };

  const submitReport = (commentId: string) => {
    if (!currentUserId) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    const formData = new FormData();
    formData.set("commentId", commentId);
    formData.set("reasonCode", reportReason);
    formData.set("memo", reportMemo);
    run(onReport, formData);
    setActiveReportId(null);
    setReportReason("");
    setReportMemo("");
  };

  return (
    <section className="rounded-2xl border border-ice-100 bg-white p-6">
      <div className="text-lg font-semibold text-navy-700">{labels.title}</div>
      <div className="mt-3 grid gap-2">
        <textarea
          value={newBody}
          onChange={(event) => setNewBody(event.target.value)}
          placeholder={labels.addPlaceholder}
          rows={3}
          className="rounded-xl border border-ice-200 px-3 py-2 text-sm"
          disabled={isPending}
        />
        <button
          type="button"
          onClick={submitNew}
          className="self-start rounded-full border border-ice-200 px-4 py-2 text-xs font-semibold"
          disabled={isPending}
        >
          {labels.addButton}
        </button>
      </div>

      {parents.length === 0 ? (
        <div className="mt-4 text-xs text-navy-500">{labels.empty}</div>
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          {parents.map((comment) => {
            const isOwner = currentUserId && comment.userId === currentUserId;
            const isDeleted = !!comment.deletedAt;
            const isHidden = comment.isHidden;
            const replies = repliesByParent.get(comment.id) ?? [];
            return (
              <div key={comment.id} className="rounded-xl border border-ice-100 bg-ice-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-navy-500">
                      {comment.userName} · {formatDate(comment.createdAt, locale)}
                    </div>
                    {isDeleted ? (
                      <div className="mt-2 text-sm text-navy-400">{labels.deletedLabel}</div>
                    ) : isHidden ? (
                      <div className="mt-2 text-sm text-navy-400">{labels.hiddenLabel}</div>
                    ) : activeEditId === comment.id ? (
                      <div className="mt-2 grid gap-2">
                        <textarea
                          value={editBody}
                          onChange={(event) => setEditBody(event.target.value)}
                          rows={3}
                          className="rounded-xl border border-ice-200 px-3 py-2 text-sm"
                        />
                        <div className="flex gap-2 text-xs">
                          <button
                            type="button"
                            onClick={() => submitEdit(comment.id)}
                            className="rounded-full border border-ice-200 px-3 py-1"
                          >
                            {labels.saveButton}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveEditId(null);
                              setEditBody("");
                            }}
                            className="rounded-full border border-ice-200 px-3 py-1"
                          >
                            {labels.cancelButton}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 text-sm text-navy-700">{comment.body}</div>
                    )}
                  </div>
                  <div className="flex gap-2 text-xs text-navy-600">
                    {!isDeleted && !isHidden ? (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveReplyId(comment.id);
                          setReplyBody("");
                        }}
                      >
                        {labels.replyButton}
                      </button>
                    ) : null}
                    {!isDeleted && !isHidden && isOwner ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveEditId(comment.id);
                            setEditBody(comment.body);
                          }}
                        >
                          {labels.editButton}
                        </button>
                        <button type="button" onClick={() => submitDelete(comment.id)}>
                          {labels.deleteButton}
                        </button>
                      </>
                    ) : null}
                    {!isDeleted && !isHidden && !isOwner ? (
                      <button
                        type="button"
                        onClick={() => setActiveReportId(comment.id)}
                      >
                        {labels.reportButton}
                      </button>
                    ) : null}
                  </div>
                </div>

                {activeReplyId === comment.id ? (
                  <div className="mt-3 grid gap-2 rounded-xl border border-ice-100 bg-white p-3">
                    <textarea
                      value={replyBody}
                      onChange={(event) => setReplyBody(event.target.value)}
                      rows={3}
                      className="rounded-xl border border-ice-200 px-3 py-2 text-sm"
                    />
                    <div className="flex gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => submitReply(comment.id)}
                        className="rounded-full border border-ice-200 px-3 py-1"
                      >
                        {labels.saveButton}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveReplyId(null)}
                        className="rounded-full border border-ice-200 px-3 py-1"
                      >
                        {labels.cancelButton}
                      </button>
                    </div>
                  </div>
                ) : null}

                {activeReportId === comment.id ? (
                  <div className="mt-3 grid gap-2 rounded-xl border border-ice-100 bg-white p-3">
                    <label className="text-xs text-navy-600">
                      {labels.reportReasonLabel}
                      <select
                        value={reportReason}
                        onChange={(event) => setReportReason(event.target.value)}
                        className="mt-2 w-full rounded-xl border border-ice-200 px-3 py-2 text-sm"
                      >
                        <option value="">--</option>
                        {reasonOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="text-xs text-navy-600">
                      {labels.reportMemoLabel}
                      <textarea
                        value={reportMemo}
                        onChange={(event) => setReportMemo(event.target.value)}
                        rows={3}
                        className="mt-2 w-full rounded-xl border border-ice-200 px-3 py-2 text-sm"
                      />
                    </label>
                    <div className="flex gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => submitReport(comment.id)}
                        className="rounded-full border border-ice-200 px-3 py-1"
                      >
                        {labels.reportSubmitLabel}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveReportId(null)}
                        className="rounded-full border border-ice-200 px-3 py-1"
                      >
                        {labels.cancelButton}
                      </button>
                    </div>
                  </div>
                ) : null}

                {replies.length > 0 ? (
                  <div className="mt-3 flex flex-col gap-3">
                    {replies.map((reply) => {
                      const replyOwner = currentUserId && reply.userId === currentUserId;
                      const replyDeleted = !!reply.deletedAt;
                      const replyHidden = reply.isHidden;
                      return (
                        <div
                          key={reply.id}
                          className="rounded-xl border border-ice-100 bg-white px-3 py-2"
                        >
                          <div className="text-[11px] text-navy-500">
                            {reply.userName} · {formatDate(reply.createdAt, locale)}
                          </div>
                      {replyDeleted ? (
                            <div className="mt-2 text-xs text-navy-400">
                              {labels.deletedLabel}
                            </div>
                      ) : replyHidden ? (
                            <div className="mt-2 text-xs text-navy-400">
                              {labels.hiddenLabel}
                            </div>
                      ) : activeEditId === reply.id ? (
                        <div className="mt-2 grid gap-2">
                          <textarea
                            value={editBody}
                            onChange={(event) => setEditBody(event.target.value)}
                            rows={3}
                            className="rounded-xl border border-ice-200 px-3 py-2 text-sm"
                          />
                          <div className="flex gap-2 text-xs">
                            <button
                              type="button"
                              onClick={() => submitEdit(reply.id)}
                              className="rounded-full border border-ice-200 px-3 py-1"
                            >
                              {labels.saveButton}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveEditId(null);
                                setEditBody("");
                              }}
                              className="rounded-full border border-ice-200 px-3 py-1"
                            >
                              {labels.cancelButton}
                            </button>
                          </div>
                        </div>
                          ) : (
                            <div className="mt-2 text-sm text-navy-700">{reply.body}</div>
                          )}
                          {!replyDeleted && !replyHidden && replyOwner ? (
                            <div className="mt-2 flex gap-2 text-xs text-navy-600">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveEditId(reply.id);
                                  setEditBody(reply.body);
                                }}
                              >
                                {labels.editButton}
                              </button>
                              <button
                                type="button"
                                onClick={() => submitDelete(reply.id)}
                              >
                                {labels.deleteButton}
                              </button>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
