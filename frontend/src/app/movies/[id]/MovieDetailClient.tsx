"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Star, Play, ChevronRight, Share2, Info, Edit, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import ConfirmModal from "@/components/ConfirmModal";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { trackGAEvent, GAEVENTS } from "@/lib/analytics";

interface MovieDetailClientProps {
  movie: any;
  similarMovies: any[];
}

const CAST = [
    { name: "Ranveer Singh", role: "as Hamza Ali Mazari", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200" },
    { name: "Sanjay Dutt", role: "as SP Chaudhary", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200" },
    { name: "R. Madhavan", role: "as Ajay Sanyal", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200" },
    { name: "Arjun Rampal", role: "as Major Iqbal", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200" },
    { name: "Sara Arjun", role: "as Yalina Jamali", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200" }
];

const REVIEWS = [
    { user: "Sujit", rating: 10, comment: "Aditya Dhar and his entire team nailed it. A must watch movie. A great cinematic experience. #BalidaanParamDharma #JaiHind", tags: ["#SuperDirection", "#GreatActing", "#AwesomeStory"] },
    { user: "Prabhav", rating: 10, comment: "Aditya Dhar and his entire team nailed it. A must watch movie. A great cinematic experience. #BalidaanParamDharma #JaiHind", tags: ["#SuperDirection", "#GreatActing", "#WowMusic"] }
];



export default function MovieDetailClient({ movie, similarMovies }: MovieDetailClientProps) {
    const router = useRouter();
    const [showFullCast, setShowFullCast] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
    const [showSticky, setShowSticky] = useState(false);
    const [reviews, setReviews] = useState<any[]>([]);
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [ratingVal, setRatingVal] = useState(10);
    const [reviewComment, setReviewComment] = useState("");
    const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("accessToken");
            if (token) {
                try {
                    const { data } = await api.get('/auth/me');
                    if(data.success) setCurrentUser(data.user);
                } catch(e) {}
            }
        };
        fetchUser();

        const fetchReviews = async () => {
            try {
                const { data } = await api.get(`/reviews/movie/${movie._id}`);
                if (data.success) setReviews(data.data);
            } catch (err) {
                console.error("Failed to fetch genuine reviews", err);
            }
        };
        fetchReviews();

        const handleScroll = () => {
            setShowSticky(window.scrollY > 450);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [movie._id]);

    useEffect(() => {
        trackGAEvent(GAEVENTS.MOVIE_VIEW, { movieId: movie._id, title: movie.title });
    }, [movie._id]);

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: movie.title,
                    text: `Check out ${movie.title} on SnapMyShow!`,
                    url: window.location.href,
                });
            } else {
                await navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard!');
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    const submitReview = async () => {
        if(!currentUser) {
            toast.error('Please login to post a review');
            return router.push('/login');
        }
        setIsSubmitting(true);
        try {
            if (editingReviewId) {
                await api.put(`/reviews/${editingReviewId}`, { rating: ratingVal, comment: reviewComment, tags: [] });
            } else {
                await api.post(`/reviews/movie/${movie._id}`, { rating: ratingVal, comment: reviewComment, tags: [] });
            }
            setIsRatingModalOpen(false);
            setReviewComment("");
            setRatingVal(10);
            setEditingReviewId(null);
            
            // Refetch strictly to get fresh data
            const { data } = await api.get(`/reviews/movie/${movie._id}`);
            if (data.success) setReviews(data.data);
        } catch(err: any) {
            toast.error(err?.response?.data?.message || 'Error submitting review');
        } finally {
            setIsSubmitting(false);
        }
    };

    const deleteReview = async (id: string) => {
        setReviewToDelete(id);
        setIsConfirmOpen(true);
    };

    const confirmDeleteReview = async () => {
        if (!reviewToDelete) return;
        try {
            await api.delete(`/reviews/${reviewToDelete}`);
            setReviews(prev => prev.filter(r => r._id !== reviewToDelete));
            toast.success("Review deleted");
        } catch(err) {
            toast.error("Failed to delete review");
        } finally {
            setReviewToDelete(null);
        }
    };


    const openEditModal = (r: any) => {
        setEditingReviewId(r._id);
        setRatingVal(r.rating);
        setReviewComment(r.comment);
        setIsRatingModalOpen(true);
    };

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Sticky Header */}
      <AnimatePresence>
        {showSticky && (
            <motion.div 
                initial={{ y: -64, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -64, opacity: 0 }}
                className="fixed top-16 left-0 right-0 h-16 bg-white z-40 border-b border-gray-200 flex items-center shadow-md md:top-24"
            >
                <div className="container mx-auto px-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[#333333]">{movie.title}</h2>
                    <Link href={`/movies/${movie._id}/showtimes`}>
                      <Button className="bg-primary hover:bg-rose-600 font-bold px-8 h-10 rounded-lg">Book tickets</Button>
                    </Link>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Header Section */}
      <section className="relative w-full overflow-hidden bg-[#1A1A1A]">
        {/* Background Banner */}
        <div className="absolute inset-0 z-0">
            <Image 
                src={movie.bannerUrl || movie.posterUrl} 
                alt={movie.title}
                fill
                className="object-cover opacity-30 object-right"
                priority
            />
            {/* Linear gradient fade from left to right */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a] via-[#1a1a1a] to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent" />
        </div>

        <div className="container relative z-10 mx-auto px-4 max-w-6xl py-12">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                
                {/* Poster */}
                <div className="relative shrink-0 flex flex-col pt-4">
                    <div className="relative aspect-[2/3] w-[260px] rounded-t-xl rounded-b-xl overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.5)] z-10">
                        <Image src={movie.posterUrl} alt={movie.title} fill className="object-cover" priority sizes="(max-width: 640px) 100vw, 260px" />
                        <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                             <Button className="bg-black/70 hover:bg-black/90 text-white text-[11px] font-semibold h-7 px-4 rounded-full backdrop-blur-md border border-white/20">
                                 <Play className="h-3 w-3 mr-1.5 fill-white" /> Trailers (11)
                             </Button>
                        </div>
                    </div>
                    {/* In cinemas badge stitched to poster */}
                    <div className="bg-black w-full text-white text-center text-[10px] font-bold py-1.5 rounded-b-xl -translate-y-2 pt-3 z-0">
                       In cinemas
                    </div>
                </div>

                {/* Movie Meta */}
                <div className="flex-1 space-y-6 pt-10">
                    <div className="flex justify-between items-start">
                        <h1 className="text-[34px] md:text-[38px] font-bold tracking-tight leading-tight text-white">{movie.title}</h1>
                        <Button onClick={handleShare} variant="outline" className="bg-black/40 hover:bg-white/10 text-white border-none rounded h-10 px-6 flex items-center">
                            <Share2 className="h-4 w-4 mr-2" /> <span className="font-semibold text-sm">Share</span>
                        </Button>
                    </div>

                    {/* Rating Banner */}
                    <div className="bg-[#333333] rounded-xl p-4 flex items-center justify-between shadow-lg max-w-[420px]">
                        <div className="flex items-center space-x-3 cursor-pointer">
                            <Star className="h-6 w-6 text-primary fill-primary" />
                            <div className="flex items-center space-x-1.5">
                                <span className="text-xl font-bold text-white">{movie.rating}/10</span>
                                <span className="text-sm text-white/90 font-medium">(508K+ Votes)</span>
                                <ChevronRight className="h-4 w-4 text-white" />
                            </div>
                        </div>
                        <Button onClick={() => setIsRatingModalOpen(true)} className="bg-white text-[#333333] hover:bg-gray-100 font-bold px-4 h-9 rounded-lg">Rate now</Button>
                    </div>

                    {/* Format/Language Tags */}
                    <div className="flex flex-wrap gap-2 text-[13px] font-medium mt-1">
                        <div className="bg-[#E5E7EB] text-[#333333] px-3 py-0.5 rounded shadow-sm hover:underline cursor-pointer">2D, DOLBY CINEMA 2D, IMAX 2D</div>
                        <div className="bg-[#E5E7EB] text-[#333333] px-3 py-0.5 rounded shadow-sm hover:underline cursor-pointer">{movie.language?.join(', ')}, +3</div>
                    </div>

                    {/* Mini Info */}
                    <div className="flex items-center text-[15px] font-medium text-white pb-3">
                        <span>{Math.floor(movie.duration / 60)}h {movie.duration % 60}m</span>
                        <span className="mx-2">•</span>
                        <span>{movie.genre?.join(', ')}</span>
                        <span className="mx-2">•</span>
                        <span>A</span>
                        <span className="mx-2">•</span>
                        <span>19 Mar, 2026</span>
                    </div>

                    {/* CTA Button */}
                    <div>
                        <Link href={`/movies/${movie._id}/showtimes`}>
                            <Button className="bg-primary hover:bg-rose-600 text-white font-bold text-[16px] h-[52px] px-14 rounded-lg shadow-lg w-[220px]">
                                Book tickets
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="container mx-auto px-4 pt-10 pb-20 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-12">
            
            {/* Left Column Content */}
            <div className="flex-1 space-y-10">
                {/* About */}
                <div className="space-y-4">
                    <h2 className="text-[20px] font-bold text-[#333333]">About the movie</h2>
                    <p className="text-[#333333]/90 text-[15px] leading-[1.6]">
                        {movie.description}
                        <br/><br/>
                        The film is set to return this time in Hindi, Telugu, Tamil, Kannada and Malayalam.
                    </p>
                </div>

                {/* Movie Trailer Section */}
                {movie.trailerUrl && (
                    <div className="space-y-6 pt-4">
                        <div className="flex items-center space-x-3">
                            <div className="h-6 w-1 bg-primary rounded-full" />
                            <h2 className="text-[20px] font-bold text-[#333333] uppercase tracking-tight">Watch Trailer</h2>
                        </div>
                        <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl bg-black border border-gray-100">
                             <iframe 
                                src={movie.trailerUrl.includes('embed') ? movie.trailerUrl : `https://www.youtube.com/embed/${movie.trailerUrl.split('v=')[1]?.split('&')[0] || movie.trailerUrl.split('/').pop()}`}
                                title={`${movie.title} Trailer`}
                                className="absolute inset-0 w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                             />
                        </div>
                    </div>
                )}
                <div className="border-t border-gray-200" />

                {/* Top Offers */}
                <div className="space-y-6">
                    <h2 className="text-[20px] font-bold text-[#333333]">Top offers for you</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="bg-[#FFF9E5] border border-dashed border-[#FAD889] rounded-xl p-4 flex items-start space-x-3 cursor-pointer group hover:bg-[#FFF4D1] transition-colors relative">
                           <div className="h-6 w-6 mt-1 shrink-0 bg-white rounded-full flex items-center justify-center border border-[#FAD889]">
                               <svg className="w-3.5 h-3.5 text-primary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                           </div>
                           <div className="pr-4">
                               <h4 className="font-semibold text-[#333333] text-[15px]">YES Private Debit Card Offer</h4>
                               <p className="text-[13px] text-[#333333]/60 mt-0.5">Tap to view details</p>
                           </div>
                       </div>
                       
                       <div className="bg-[#FFF9E5] border border-dashed border-[#FAD889] rounded-xl p-4 flex items-start space-x-3 cursor-pointer group hover:bg-[#FFF4D1] transition-colors relative">
                           <div className="h-6 w-6 mt-1 shrink-0 bg-white rounded-full flex items-center justify-center border border-[#FAD889]">
                               <svg className="w-3.5 h-3.5 text-primary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                           </div>
                           <div className="pr-4">
                               <h4 className="font-semibold text-[#333333] text-[15px] truncate max-w-[200px]">Buy 1 get 1 movie ticket free + 50% off on non...</h4>
                               <p className="text-[13px] text-[#333333]/60 mt-0.5">Tap to view details</p>
                           </div>
                           <div className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 bg-gray-500/80 rounded-full flex items-center justify-center">
                                <ChevronRight className="h-4 w-4 text-white" />
                           </div>
                       </div>
                    </div>
                </div>
                <div className="border-t border-gray-200" />

                {/* Cast */}
                {movie.cast && movie.cast.length > 0 && (
                    <div className="space-y-6">
                        <h2 className="text-[20px] font-bold text-[#333333]">Cast</h2>
                        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-none relative">
                            {movie.cast.map((actor: any, i: number) => (
                                <div key={i} className="flex flex-col items-center shrink-0 w-[100px]">
                                    <div className="relative h-[100px] w-[100px] rounded-full overflow-hidden mb-2">
                                        <Image src={actor.imageUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200"} alt={actor.name} fill className="object-cover" />
                                    </div>
                                    <span className="text-[14px] font-bold text-[#333333] text-center leading-tight line-clamp-1">{actor.name}</span>
                                    {actor.role && <span className="text-[12px] text-[#666666] text-center mt-0.5">{actor.role}</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {movie.cast && movie.cast.length > 0 && <div className="border-t border-gray-200" />}

                {/* Top Reviews */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-[20px] font-bold text-[#333333]">Top reviews</h2>
                        <span className="text-primary font-medium text-sm flex items-center">{movie.totalVotes || 0} reviews <ChevronRight className="h-4 w-4" /></span>
                    </div>
                    <p className="text-[13px] text-[#666666]">Summary of {movie.totalVotes || 0} reviews.</p>
                    
                    <div className="flex flex-wrap gap-3 mb-6">
                        <Badge variant="outline" className="font-normal text-[13px] text-[#333333] border-gray-300 py-1.5 px-4 cursor-pointer hover:bg-gray-50 rounded-full">
                            <span className="text-primary mr-1">#SuperDirection</span> <span className="bg-gray-200 px-1.5 py-0.5 rounded text-[11px] ml-1">{(movie.totalVotes || 0) * 0.8}</span>
                        </Badge>
                        <Badge variant="outline" className="font-normal text-[13px] text-[#333333] border-gray-300 py-1.5 px-4 cursor-pointer hover:bg-gray-50 rounded-full">
                            <span className="text-primary mr-1">#GreatActing</span> <span className="bg-gray-200 px-1.5 py-0.5 rounded text-[11px] ml-1">{(movie.totalVotes || 0) * 0.7}</span>
                        </Badge>
                        <Badge variant="outline" className="font-normal text-[13px] text-[#333333] border-gray-300 py-1.5 px-4 cursor-pointer hover:bg-gray-50 rounded-full">
                            <span className="text-primary mr-1">#Blockbuster</span> <span className="bg-gray-200 px-1.5 py-0.5 rounded text-[11px] ml-1">{(movie.totalVotes || 0) * 0.9}</span>
                        </Badge>
                    </div>

                    {reviews.length === 0 ? (
                        <div className="text-sm text-gray-500 py-6 text-center border border-dashed border-gray-300 rounded-xl bg-gray-50">
                            No reviews yet. Click 'Rate now' to be the first!
                        </div>
                    ) : (
                        <div className="relative overflow-hidden group pb-4 w-full cursor-pointer">
                            <motion.div 
                                className="flex w-max space-x-4"
                                animate={{ x: [0, -100 * reviews.length] }}
                                transition={{ repeat: Infinity, ease: "linear", duration: reviews.length * 3 + 10 }}
                                whileHover={{ animationPlayState: "paused", transition: { duration: 0 } }}
                            >
                                {reviews.concat(reviews).map((review, i) => ( // Duplicate array for continuous loop
                                    <div key={i} className="w-[320px] shrink-0 border border-gray-200 rounded-xl p-5 bg-white space-y-3 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 uppercase font-bold text-lg">
                                                    {review.userId?.name?.charAt(0) || "U"}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[14px] text-[#333333] font-semibold">{review.userId?.name || "Anonymous"}</span>
                                                    <span className="text-[11px] text-[#666666]">Booked on book<span className="font-bold text-primary">my</span>show</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <Star className="h-4 w-4 text-primary fill-primary" />
                                                <span className="text-[14px] text-[#333333] font-bold">{review.rating}/10</span>
                                            </div>
                                        </div>
                                        
                                        <div className="text-[14px] font-medium text-[#333333]">
                                            {review.tags?.join(' ') || '#Awesome'}
                                        </div>
                                        <p className="text-[13px] text-[#666666] leading-relaxed line-clamp-3 h-[60px]">
                                            {review.comment}
                                        </p>
                                        
                                        <div className="flex items-center justify-between pt-2">
                                            <div className="flex items-center space-x-4 text-[#666666] text-[13px]">
                                                <span className="flex items-center hover:text-black"><svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg> {review.likes || 0}</span>
                                                <span className="flex items-center hover:text-black"><svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" /></svg></span>
                                            </div>
                                            <div className="flex items-center space-x-3 text-[#666666] text-[13px]">
                                                {currentUser && review.userId && currentUser._id === review.userId._id && (
                                                    <div className="flex space-x-2">
                                                        <Edit onClick={() => openEditModal(review)} className="h-4 w-4 hover:text-blue-600 transition-colors" />
                                                        <Trash2 onClick={() => deleteReview(review._id)} className="h-4 w-4 hover:text-red-600 transition-colors" />
                                                    </div>
                                                )}
                                                <span>{new Date(review.createdAt || Date.now()).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        </div>
                    )}
                </div>
                <div className="border-t border-gray-200" />
                
                {/* You might also like - Real data from same genre */}
                <div className="space-y-6 pt-2 relative">
                    <div className="flex items-center justify-between">
                        <h2 className="text-[20px] font-bold text-[#333333]">You might also like</h2>
                        <Link
                            href={`/movies?genre=${encodeURIComponent(movie.genre?.[0] || '')}`}
                            className="text-primary font-medium text-sm flex items-center hover:underline"
                        >
                            View All <ChevronRight className="h-4 w-4 ml-0.5" />
                        </Link>
                    </div>

                    {similarMovies.length === 0 ? (
                        <p className="text-[#888888] text-sm py-4">No similar movies found right now.</p>
                    ) : (
                        <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-none">
                            {similarMovies.map((rec: any) => (
                                <Link
                                    key={rec._id}
                                    href={`/movies/${rec._id}`}
                                    className="flex flex-col shrink-0 w-[180px] group"
                                >
                                    <div className="relative h-[268px] w-full rounded-xl overflow-hidden mb-3 bg-gray-100 shadow-sm">
                                        <Image
                                            src={rec.posterUrl}
                                            alt={rec.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            sizes="180px"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                                        {rec.genre?.[0] && (
                                            <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-black/50 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
                                                {rec.genre[0]}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-1 mb-1 text-[13px]">
                                        <Star className="h-3.5 w-3.5 text-primary fill-primary shrink-0" />
                                        <span className="font-semibold text-[#333333]">{rec.rating}</span>
                                        <span className="text-[#aaaaaa] text-[11px]">/10</span>
                                    </div>
                                    <span className="text-[14px] font-medium text-[#333333] leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                                        {rec.title}
                                    </span>
                                    <span className="text-[12px] text-[#999999] mt-0.5">
                                        {Math.floor(rec.duration / 60)}h {rec.duration % 60}m
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

            </div>
            
            {/* Empty Right Column mapping empty space on BMS */}
            <div className="hidden lg:block lg:w-[250px]">
            </div>
        </div>
      </section>

      {/* Review Modal */}
      <AnimatePresence>
        {isRatingModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-[#333333]">{editingReviewId ? 'Edit your review' : 'Rate this movie'}</h3>
                        <X onClick={() => {setIsRatingModalOpen(false); setEditingReviewId(null);}} className="h-6 w-6 text-gray-400 hover:text-black cursor-pointer" />
                    </div>
                    
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
                                <span>Your Rating</span>
                                <span className={ratingVal >= 8 ? "text-green-600" : ratingVal >= 5 ? "text-yellow-600" : "text-red-600"}>{ratingVal}/10</span>
                            </div>
                            <input 
                                type="range" 
                                min="1" 
                                max="10" 
                                value={ratingVal} 
                                aria-label="Movie Rating out of 10"
                                onChange={e => setRatingVal(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" 
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Review (Optional)</label>
                            <textarea 
                                value={reviewComment}
                                onChange={e => setReviewComment(e.target.value)}
                                placeholder="What did you think of the movie?"
                                className="w-full border border-gray-300 rounded-xl p-3 h-28 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none text-[14px]"
                            />
                        </div>
                        
                        <Button 
                            onClick={submitReview} 
                            disabled={isSubmitting}
                            className="w-full bg-primary hover:bg-rose-600 h-12 text-[16px] font-bold rounded-xl"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Rating'}
                        </Button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDeleteReview}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        type="danger"
        confirmText="Delete"
      />
    </div>
  );
}
